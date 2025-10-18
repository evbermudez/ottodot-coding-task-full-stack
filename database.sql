-- Create math_problem_sessions table
CREATE TABLE IF NOT EXISTS math_problem_sessions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    difficulty TEXT NOT NULL DEFAULT 'medium',
    problem_type TEXT NOT NULL DEFAULT 'mixed',
    problem_text TEXT NOT NULL,
    correct_answer NUMERIC NOT NULL
);

-- If the table already exists, run the following once to add the difficulty column:
-- ALTER TABLE math_problem_sessions ADD COLUMN IF NOT EXISTS difficulty TEXT NOT NULL DEFAULT 'medium';
-- ALTER TABLE math_problem_sessions ADD COLUMN IF NOT EXISTS problem_type TEXT NOT NULL DEFAULT 'mixed';

-- Create math_problem_submissions table
CREATE TABLE IF NOT EXISTS math_problem_submissions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    session_id UUID NOT NULL REFERENCES math_problem_sessions(id) ON DELETE CASCADE,
    user_answer NUMERIC NOT NULL,
    is_correct BOOLEAN NOT NULL,
    feedback_text TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE math_problem_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE math_problem_submissions ENABLE ROW LEVEL SECURITY;

-- Create permissive policies for anonymous access (for assessment purposes)
-- In production, you would want more restrictive policies

-- Allow anonymous users to read and insert math_problem_sessions
CREATE POLICY "Allow anonymous access to math_problem_sessions" ON math_problem_sessions
    FOR ALL
    USING (true)
    WITH CHECK (true);

-- Allow anonymous users to read and insert math_problem_submissions
CREATE POLICY "Allow anonymous access to math_problem_submissions" ON math_problem_submissions
    FOR ALL
    USING (true)
    WITH CHECK (true);

-- Create indexes for better performance
CREATE INDEX idx_math_problem_submissions_session_id ON math_problem_submissions(session_id);
CREATE INDEX idx_math_problem_sessions_created_at ON math_problem_sessions(created_at DESC);
