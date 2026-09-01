const express = require('express');
const pool = require('../database/db');

const router = express.Router();


// ---- GET /api/success-stories ----
router.get('/', async (req, res) => {
  try {
    const [stories] = await pool.query(
      'SELECT id, text, text_sr FROM success_stories ORDER BY sort_order ASC, id ASC'
    );

    if (stories.length > 0) {
      const [images] = await pool.query(
        'SELECT story_id, image FROM success_story_images WHERE story_id IN (?) ORDER BY sort_order ASC, id ASC',
        [stories.map(story => story.id)]
      );

      const imagesByStory = {};
      for (const img of images) {
        (imagesByStory[img.story_id] ??= []).push(img.image);
      }

      for (const story of stories) {
        story.images = imagesByStory[story.id] || [];
      }
    }

    res.json(stories);

  } catch (error) {
    console.error('Greška pri čitanju uspješnih priča:', error.message);
    res.status(500).json({ error: 'Database error' });
  }
});


module.exports = router;
