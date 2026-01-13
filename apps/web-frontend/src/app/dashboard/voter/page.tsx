"use client";

/* eslint-disable @typescript-eslint/no-explicit-any */
import DashboardShell from "@/components/dashboard-shell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { CheckCircle2 } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

interface Referendum {
  _id: string;
  referendum_title: string;
  referendum_desc: string;
  status: string; 
  referendum_options: { text: string; votes: number }[];
  alreadyVoted?: boolean;
}

/**
 * Voter Dashboard displaying open referendums to cast a vote
 */
const VoterDashboard = () => {
  const [referendums, setReferendums] = useState<Referendum[]>([]);
  const [selectedOptions, setSelectedOptions] = useState<{ [key: string]: number }>({});
  const [isSubmitting, setIsSubmitting] = useState<string | null>(null);
  const [votedIds, setVotedIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOpen = async () => {
      const token = localStorage.getItem("token");
      try {
        const res = await fetch("http://localhost:3001/mslr/vote/available", {
          headers: { Authorization: `Bearer ${token}` }
        });
        const data = await res.json();

        const filteredData = data.filter((ref: any) => {
          const isOpen = ref.status?.toLowerCase() === 'open';
          const hasVoted = ref.alreadyVoted === true;
          return isOpen || hasVoted;
        });

        setReferendums(filteredData);

        const alreadyVoted = filteredData
          .filter((r: any) => r.alreadyVoted)
          .map((r: any) => r._id);
        setVotedIds(alreadyVoted);
      } catch (err: any) {
        toast.error("Failed to load active referendums");
      } finally {
        setLoading(false);
      }
    };
    fetchOpen();
  }, []);

  const handleVote = async (referendumId: string) => {
    const optionIndex = selectedOptions[referendumId];
    if (optionIndex === undefined) {
      toast.error("Please select an option before voting.");
      return;
    }

    setIsSubmitting(referendumId);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`http://localhost:3001/mslr/vote/cast/${referendumId}`, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}` 
        },
        body: JSON.stringify({ optionIndex }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Vote failed");

      toast.success("Your vote has been cast successfully!");
      setVotedIds(prev => [...prev, referendumId]);
      
      setReferendums(prev => prev.map(r => 
        r._id === referendumId ? { ...r, alreadyVoted: true } : r
      ));
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setIsSubmitting(null);
    }
  };

  if (loading) return <DashboardShell><div className="p-10 text-center">Loading...</div></DashboardShell>;

  return (
    <DashboardShell>
      <div className="mb-8" >
        <h1 className="text-3xl font-bold">Voter Portal</h1>
        <p className="text-muted-foreground tracking-tight">Your participation is Anonymous and Secure.</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {referendums.length === 0 ? (
          <Card className="col-span-full p-12 text-center border-dashed">
            <p className="text-muted-foreground">There are currently no active referendums for you to vote on.</p>
          </Card>
        ) : (
          referendums.map((ref) => {
            const hasVoted = votedIds.includes(ref._id) || ref.alreadyVoted;

            return (
              <Card key={ref._id} className={hasVoted ? "opacity-90 border-green-200 bg-green-50/30 flex flex-col" : "flex flex-col"}>
                <CardHeader>
                  <CardTitle className="flex justify-between items-start gap-2 text-lg">
                    <span className={hasVoted ? "text-green-900" : ""}>{ref.referendum_title}</span>
                    {hasVoted && (
                      <Badge variant="outline" className="bg-green-100 text-green-700 border-green-300 shrink-0">
                        Voted
                      </Badge>
                    )}
                  </CardTitle>
                  <CardDescription className="line-clamp-3">{ref.referendum_desc}</CardDescription>
                </CardHeader>

                <CardContent className="flex-1">
                  {hasVoted ? (
                    <div className="py-6 flex flex-col items-center justify-center text-center space-y-2 bg-white/50 rounded-lg border border-green-100">
                      <CheckCircle2 className="h-8 w-8 text-green-600" />
                      <p className="text-sm font-semibold text-green-800">Participation Confirmed</p>
                      <p className="text-xs text-green-600/80 px-4">Thank you for your anonymous contribution.</p>
                    </div>
                  ) : (
                    <RadioGroup 
                      onValueChange={(val) => setSelectedOptions(prev => ({ ...prev, [ref._id]: parseInt(val) }))}
                      className="space-y-3"
                    >
                      {ref.referendum_options.map((opt, idx) => (
                        <div key={idx} className="flex items-center space-x-3 p-2 rounded-md hover:bg-slate-50 transition-colors">
                          <RadioGroupItem value={idx.toString()} id={`${ref._id}-${idx}`} />
                          <Label htmlFor={`${ref._id}-${idx}`} className="font-normal cursor-pointer flex-1 py-1">
                            {opt.text}
                          </Label>
                        </div>
                      ))}
                    </RadioGroup>
                  )}
                </CardContent>

                {!hasVoted && (
                  <CardFooter className="pt-4">
                    <Button 
                      className="w-full bg-slate-900 hover:bg-slate-800" 
                      onClick={() => handleVote(ref._id)}
                      disabled={isSubmitting === ref._id}
                    >
                      {isSubmitting === ref._id ? "Recording..." : "Cast Vote"}
                    </Button>
                  </CardFooter>
                )}
              </Card>
            );
          })
        )}
      </div>
    </DashboardShell>
  );
};

export default VoterDashboard;