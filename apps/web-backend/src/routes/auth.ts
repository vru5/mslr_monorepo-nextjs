import { Router } from "express";
import type { Request, Response } from "express";
import crypto from "crypto";
import voter from "../models/voter.js";
import preAuthorizedScc from "../models/preAuthorizedScc.js";
import jwt from "jsonwebtoken";


const router = Router();

/**
 * Post method for registration
 */
router.post('/register', async (req: Request, res: Response) => {
    try{
        const { fullName, email, password, scc, dob } = req.body;

        //1. Check if SCC exists or not
        const authScc = await preAuthorizedScc.findOne({ scc });

        if(!authScc){
            return res.status(403).json({
                message: "This SCC is invalid."
            });
        }

        //2. Check if the SCC has already been used
        if(authScc.isUsed){
            return res.status(400).json({
                message: "SCC has already been used."
            });
        }

        //3. Check if eamail is unique
        const existingEmail = await voter.findOne({ email });
        if(existingEmail) {
            return res.status(400).json({
                message: "Email is already in use."
            });
        }

        //4. SToring password using sha-256
        const hashedPassword = crypto.createHash('sha256').update(password).digest('hex');

        //5. Creating a new user
        const newVoter = new voter({
            fullName,
            email,
            hashedPassword,
            scc,
            dob: new Date(dob)
        });

        await newVoter.save();

        //6. Marking the scc as used
        authScc.isUsed = true;
        await authScc.save();

        res.status(201).json({
            message: "User Registered Successfully"
        });

    } catch (err) {
        console.error("Registration Error: ", err);
        res.status(500).json({
            message: "Server error. User not registered."
        });
    }
});


/**
 * Post method for login
 */
router.post('/login', async (req: Request, res: Response) => {
    try {
        const { email, password } = req.body;

        const user = await voter.findOne({ email });

        if(!user) {
            return res.status(401).json({
                message: "User not found. Please register."
            });
        }

        //Hashing the password
        const inputPasswordHashed = crypto.createHash('sha256').update(password).digest('hex');

        if(inputPasswordHashed !== user.hashedPassword) {
            return res.status(401).json({
                message: "Invalid credentials."
            });
        };

        const JWT_SECRET= process.env.JWT_SECRET;

        if(!JWT_SECRET) {
            console.log("JWT_Secret not defined");
            process.exit(1);
        }

        //JWT token
        const token = jwt.sign(
            { userId: user._id, role: user.role },
            JWT_SECRET,
            { expiresIn: '24h' }           
        );

        res.json({
            message: "Login successful",
            token,
            user: {
                id: user._id,
                fullName: user.fullName,
                role: user.role
            }
        });
    } catch (err) {
        res.status(500).json({
            message: "Server error. Please try again later."
        })
    }
    
});

/**
 * Forgot Password 
 */
router.post('/verify-reset', async (req: Request, res: Response) => {
    try {
        const { email, scc, dob } = req.body;
        const user = await voter.findOne({ email });

        if (!user) return res.status(404).json({ message: "User not found" });

        const providedDob = new Date(dob).toISOString().split('T')[0];
        const storedDob = user.dob.toISOString().split('T')[0];

        if (user.scc !== scc || storedDob !== providedDob) {
            return res.status(401).json({ message: "Verification failed. Details do not match." });
        }

        res.json({ success: true, message: "Identity verified." });
    } catch (err) {
        res.status(500).json({ message: "Server error" });
    }
});

/**
 * Update new password
 */
router.post('/update-password', async (req: Request, res: Response) => {
    try {
        const { email, newPassword } = req.body;
        const user = await voter.findOne({ email });
        
        if (!user) return res.status(404).json({ message: "User not found" });

        const hashedPassword = crypto.createHash('sha256').update(newPassword).digest('hex');
        user.hashedPassword = hashedPassword;
        await user.save();

        res.json({ message: "Password updated successfully" });
    } catch (err) {
        res.status(500).json({ message: "Update failed" });
    }
});
export default router;