import { Router } from 'express';
import { authenticateToken } from '../middleware/authMiddleware.js';
import Voter from '../models/voter.js';        // Importing the Model
import Referendum from '../models/referendum.js'; // Importing the Model

const router = Router();

/**
 * Gets the list of referendums for casting a vote or display the participation if 
 * previously voted
 */
router.get('/available', authenticateToken, async (req: any, res: any) => {
  try {
    const userId = req.user.userId;
    const resident = await Voter.findById(userId);

    if (!resident) {
      return res.status(404).json({ message: "Voter not found" });
    }
    
    // Find referendums that are OPEN and NOT in the resident's votedReferendums list
    const available = await Referendum.find({
      status: { $in: ['open', 'closed'] }
    });

    const referendumsWithStatus = available.map(ref => {
      const hasVoted = resident.votedReferendums.some(
        (votedId: any) => votedId.toString() === ref._id.toString()
      );

      return {
        ...ref.toObject(),
        alreadyVoted: hasVoted
      };
    });

    res.json(referendumsWithStatus);
  } catch (error) {
    res.status(500).json({ message: "Error fetching ballots" });
  }
});

/**
 * POST api for casting a vote
 */
router.post('/cast/:referendumId', authenticateToken, async (req: any, res: any) => {
  try {
    const { referendumId } = req.params;
    const { optionIndex } = req.body; 
    const { userId } = req.user;

    const resident = await Voter.findById(userId);
    if (!resident) return res.status(404).json({ message: "Resident not found." });

    if (resident.votedReferendums.includes(referendumId as any)) {
      return res.status(403).json({ message: "You have already cast your vote." });
    }

    const currentReferendum = await Referendum.findById(referendumId);
    
    // 1. Check if Referendum exists
    if (!currentReferendum) {
      return res.status(404).json({ message: "Referendum not found." });
    }

    // 2. Check if Referendum is open
    if (currentReferendum.status !== 'open') {
      return res.status(400).json({ message: "This referendum is not open." });
    }

    // 3. NULL/BOUNDS CHECK for the referendum_options array
    // Ensure the referendum_options array exists and the index is valid
    if (!currentReferendum.referendum_options || !currentReferendum.referendum_options[optionIndex]) {
      return res.status(400).json({ message: "Invalid voting option selected." });
    }

    currentReferendum.referendum_options[optionIndex].votes += 1;

    const totalResidents = await Voter.countDocuments({ role: 'voter' });
    const votesForThisOption = currentReferendum.referendum_options[optionIndex].votes;

    if(votesForThisOption / totalResidents >= 0.5) {
      currentReferendum.status = 'closed';
    }
    
    await currentReferendum.save();
    resident.votedReferendums.push(referendumId as any);
    await resident.save();


    res.status(200).json({ message: "Vote cast successfully!" });
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
});

export default router;