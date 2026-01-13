import { Router } from 'express';
import { authenticateToken, isEC } from '../middleware/authMiddleware.js';
import referendum from '../models/referendum.js';

const router = Router();

/**
 * Create referendum eligible only for admin role
 */
router.post('/create', authenticateToken, isEC, async (req, res) => {
  try {
    const { referendum_title, referendum_desc, referendum_options } = req.body;
    const formattedOptions = referendum_options.map((opt: { text: string }) => ({ text: opt.text, votes: 0 }));
    
    const _referendum = new referendum({ 
      referendum_title, 
      referendum_desc, 
      referendum_options: formattedOptions, 
      status: 'created' 
    });
    
    await _referendum.save();

    res.status(201).json(_referendum); 
  } catch (error) {
    console.log("Create Error: ", error);
    res.status(500).json({ message: "Failed to create referendum" });
  }
});

/**
 * Edit referendum eligible only for admin role
 */
router.put('/edit/:id', authenticateToken, isEC, async (req, res) => {
  try {
    const { referendum_title, referendum_desc, referendum_options } = req.body;
    const ref = await referendum.findById(req.params.id);
    
    if (!ref) {
      return res.status(404).json({ message: "Referendum not found" });
    }

    if (ref.status !== 'created') {
      return res.status(400).json({ 
        message: "Referendum content is read-only after it has been opened or closed." 
      });
    }

    ref.referendum_title = referendum_title || ref.referendum_title;
    ref.referendum_desc = referendum_desc || ref.referendum_desc;

    if (referendum_options) {
      ref.referendum_options = referendum_options.map((opt: any) => ({ text: typeof opt === 'string' ? opt : opt.text, votes: 0 }));
    }

    await ref.save();
    res.json({ message: "Referendum updated successfully", ref });

  } catch (err) {
    res.status(500).json({ message: "Error updating referendum" });
  }
});

/**
 * View Analytics of referendums only in admin dashoard
 */
router.get('/analytics', authenticateToken, isEC, async (req, res) => {
  try {
    const stats = await referendum.find();
    res.json(stats);
  } catch (error) {
    res.status(500).json({ message: "Error fetching analytics" });
  }
});

/**
 * Returns the list of all referendums regardless of it's status
 */
router.get('/all', authenticateToken, isEC, async (req, res) => {
  try {
    const referendums = await referendum.find().sort({ createdAt: -1 });
    res.json(referendums);
  } catch (error) {
    res.status(500).json({ message: "Error fetching referendums" });
  }
});

/**
 * Edit Referendum eligible only for admin role
 */
router.patch('/:id/status', authenticateToken, isEC, async (req, res) => {
  try {
    const { status } = req.body;
    const updatedRef = await referendum.findByIdAndUpdate(
      req.params.id, 
      { status },
      { new: true }
    );
    res.json({ message: `Referendum is now ${status}`, updatedRef });
  } catch (err) {
    res.status(500).json({ message: "Error updating status" });
  }
});

export default router;