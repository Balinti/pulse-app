-- Pulse Seed Data
-- Migration 003: Seed tags and experiments

-- Seed tags
INSERT INTO tags (slug, label) VALUES
  ('meetings', 'Meetings'),
  ('conflict', 'Conflict'),
  ('deep-work', 'Deep Work'),
  ('sleep', 'Sleep'),
  ('exercise', 'Exercise'),
  ('isolation', 'Isolation'),
  ('deadlines', 'Deadlines'),
  ('travel', 'Travel');

-- Seed experiments
INSERT INTO experiments (slug, title, duration_seconds, category, steps) VALUES
  (
    'pre-meeting-reset',
    'Pre-meeting reset',
    120,
    'meetings',
    '["Take 3 deep breaths", "Write down your intention for this meeting", "Set one boundary (e.g., \"I will speak up if confused\")"]'::jsonb
  ),
  (
    'post-conflict-debrief',
    'Post-conflict debrief',
    120,
    'conflict',
    '["Write down what happened (facts only, no interpretation)", "Name the emotion you felt", "Decide: do you need to follow up, or let it go?"]'::jsonb
  ),
  (
    'shutdown-ritual',
    'Shutdown ritual',
    120,
    'shutdown',
    '["Close all Slack/Teams tabs", "Write tomorrow''s top 3 priorities", "Say out loud: \"Work is over\""]'::jsonb
  ),
  (
    'two-minute-downshift',
    'Two-minute downshift',
    120,
    'stress',
    '["Stand up and stretch", "Look at something 20 feet away for 20 seconds", "Drink a glass of water"]'::jsonb
  ),
  (
    'boundary-script',
    'Boundary script',
    120,
    'meetings',
    '["Pick one meeting today", "Practice saying: \"I have a hard stop at X time\"", "Actually leave at that time"]'::jsonb
  ),
  (
    'focus-block-protect',
    'Focus block protect',
    120,
    'deep-work',
    '["Block 90 minutes on your calendar with \"Focus time\"", "Turn off all notifications", "Work on ONE thing only"]'::jsonb
  ),
  (
    'meeting-hygiene-nudge',
    'Meeting hygiene nudge',
    120,
    'meetings',
    '["Before your next meeting, ask: Is my presence required?", "If not, decline or ask for notes instead", "Use the time for a walk or break"]'::jsonb
  ),
  (
    'recovery-block',
    'Recovery block',
    120,
    'stress',
    '["Schedule 15 minutes after your hardest meeting", "Use it for: walk, snack, or silence", "Do not open email during this time"]'::jsonb
  ),
  (
    'context-switch-cleanup',
    'Context switch cleanup',
    120,
    'deep-work',
    '["Before switching tasks, write down where you left off", "Close all tabs related to the old task", "Take 3 deep breaths before starting the new task"]'::jsonb
  ),
  (
    'tomorrow-setup',
    'Tomorrow setup',
    120,
    'shutdown',
    '["Review your calendar for tomorrow", "Identify your hardest meeting or task", "Decide on ONE experiment to try tomorrow"]'::jsonb
  );
