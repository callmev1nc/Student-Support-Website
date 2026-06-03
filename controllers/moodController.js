import sql from "../config/db.js";

export function moodLog(req, res) {
  const user = req.session.user;
  if (!user) return res.redirect('/login');

  res.render('mood-logging', {
    title: 'Mood Logging Page',
    user
  });
}

//function to add mood to the database from mood-logging page
export async function addMood(req, res) {
  const userId = req.session.user?.user_id;
  if (!userId) {
    return res.redirect(`/login`);
  }
  const { moods, notes } = req.body;
  let type = 'positive';
  if (['Sad', 'Angry', 'Worried'].includes(moods)) type = 'negative';

  try {
    await sql`INSERT INTO moods (user_id, mood, mood_type, notes, date) VALUES (${userId}, ${moods}, ${type}, ${notes || ""}, ${new Date()})`;
    console.log(`User ${userId} has logged a mood.`);

    const lastMoods = await sql`SELECT mood_type FROM moods WHERE user_id = ${userId} ORDER BY date DESC LIMIT 3`;
    const negativeStreak = lastMoods.every(m => m.mood_type === 'negative');

    //Checks if the last three moods entered as negative, then redirect to support page.
    if (negativeStreak) {
      console.log(`User ${userId} has logged 3 negative moods in a row.`);
      return res.redirect(`/support`);
    }

    //if user enters negative mood, give suggestions to help based on mood
    if (type === 'negative') {
      console.log("User logged a negative mood.");
      return res.redirect(`/mood/suggestions?mood=${encodeURIComponent(moods)}`);
    }

    //Redirect to history page only if mood is positive
    res.redirect("/mood/history");

  } catch (error) {
    console.error(`Failed to add mood for User ${userId}: ${error}`);
    res.status(500).send("Internal Server Error");
  }
}

//function to show moods entered from database to mood-history page
export async function getMood(req, res) {
  const user = req.session.user;
  if (!user) return res.redirect('/login');

  const userId = user.user_id;

  try {
    const moods = await sql`SELECT * FROM moods WHERE user_id = ${userId} ORDER BY date DESC`;

    const totalMoods = moods.length;
    const positiveMoods = moods.filter(m => m.mood_type === 'positive').length;
    const negativeMoods = moods.filter(m => m.mood_type === 'negative').length;

    res.render("mood-history", {
      title: "Mood History Page",
      headerTitle: "Mood History",
      moods,
      totalMoods,
      positiveMoods,
      negativeMoods,
      user
    });
  } catch (error) {
    console.error(`Failed to retrieve moods from DB: ${error}`);
    res.status(500).send("Internal Server Error");
  }
}


// to show suggestions based on the mood logged
export function moodSuggestions(req, res) {
  const user = req.session.user;
  if (!user) {
    return res.redirect('/login');
  }
  const mood = req.query.mood;

  console.log(`User mood is: ${mood}`);

  //suggestions based on mood. Can be added with more suggestions.
  const suggestions = {
    Sad: [
      "Take a walk in nature to lift your spirits.",
      "Spend time with loved ones.",
      "Engage in a hobby you enjoy.",
      "Listen to uplifting music."
    ],
    Angry: [
      "Practice deep breathing exercises to calm down.",
      "Engage in physical activity to release tension.",
      "Try journaling to express your feelings.",
      "Take a break and do something you enjoy."
    ],
    Worried: [
      "Write down your worries and consider possible solutions.",
      "Talk to a trusted friend or family member about your concerns.",
      "Practice mindfulness or meditation to stay present.",
      "Focus on what you can control and let go of what you can't."
    ]
  };

  const selectedSuggestions = suggestions[mood] || ["Engage in a favorite hobby to distract yourself."];

  try {
    console.log(`Suggestions for ${mood}: ${selectedSuggestions.join(", ")}`);
    res.render('suggestions', {
      title: 'Mood Suggestions Page',
      mood,
      tips: selectedSuggestions,
      user
    });

  } catch (error) {
    console.error(`Failed to render suggestions page: ${error}`);
    res.status(500).send("Internal Server Error");
  }
}


export function moodSupport(req, res) {
  res.render('support', { title: "Support Page" }); // removed the mood route requirement, avaliable to all users.
}