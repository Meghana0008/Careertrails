-- ===================================
-- Careertrails Supabase Schema
-- Run this in Supabase Dashboard > SQL Editor
-- ===================================

-- 1. Profiles table (extends auth.users)
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('user', 'team')),
  branch TEXT DEFAULT '',
  cgpa TEXT DEFAULT '',
  placement_status TEXT DEFAULT 'Unplaced' CHECK (placement_status IN ('Placed', 'Unplaced')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Jobs table (on-campus jobs posted by team)
CREATE TABLE IF NOT EXISTS jobs (
  id SERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  company TEXT NOT NULL,
  location TEXT NOT NULL,
  salary TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'Full-time',
  category TEXT NOT NULL DEFAULT 'On-Campus' CHECK (category IN ('On-Campus', 'Off-Campus')),
  description TEXT NOT NULL DEFAULT '',
  requirements TEXT[] DEFAULT '{}',
  responsibilities TEXT[] DEFAULT '{}',
  posted_by UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Applications table
CREATE TABLE IF NOT EXISTS applications (
  id SERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  job_id INTEGER NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'Under Review' CHECK (status IN ('Under Review', 'Interview Scheduled', 'Accepted', 'Rejected')),
  applied_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, job_id)
);

-- 4. Companies table
CREATE TABLE IF NOT EXISTS companies (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  industry TEXT NOT NULL,
  contact TEXT NOT NULL,
  website TEXT NOT NULL,
  status TEXT DEFAULT 'Active' CHECK (status IN ('Active', 'Pending', 'Inactive')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Drives table
CREATE TABLE IF NOT EXISTS drives (
  id SERIAL PRIMARY KEY,
  company TEXT NOT NULL,
  role TEXT NOT NULL,
  drive_date TEXT NOT NULL,
  drive_time TEXT NOT NULL,
  venue TEXT NOT NULL,
  eligible TEXT NOT NULL,
  description TEXT DEFAULT '',
  package TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Offers table
CREATE TABLE IF NOT EXISTS offers (
  id SERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  company TEXT NOT NULL,
  role TEXT NOT NULL,
  salary TEXT NOT NULL,
  offer_date TEXT NOT NULL,
  status TEXT DEFAULT 'Pending' CHECK (status IN ('Pending', 'Accepted', 'Declined')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ===================================
-- Row Level Security (RLS) Policies
-- ===================================

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE drives ENABLE ROW LEVEL SECURITY;
ALTER TABLE offers ENABLE ROW LEVEL SECURITY;

-- Profiles: users can read all profiles, update their own
CREATE POLICY "Anyone can read profiles" ON profiles FOR SELECT USING (true);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- Jobs: anyone can read, team can insert/update/delete
CREATE POLICY "Anyone can read jobs" ON jobs FOR SELECT USING (true);
CREATE POLICY "Team can insert jobs" ON jobs FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'team')
);
CREATE POLICY "Team can update jobs" ON jobs FOR UPDATE USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'team')
);
CREATE POLICY "Team can delete jobs" ON jobs FOR DELETE USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'team')
);

-- Applications: users can read own, team can read all, users can insert own
CREATE POLICY "Users read own applications" ON applications FOR SELECT USING (
  auth.uid() = user_id OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'team')
);
CREATE POLICY "Users can apply" ON applications FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Team can update applications" ON applications FOR UPDATE USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'team')
);

-- Companies: anyone can read, team can CRUD
CREATE POLICY "Anyone can read companies" ON companies FOR SELECT USING (true);
CREATE POLICY "Team can insert companies" ON companies FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'team')
);
CREATE POLICY "Team can update companies" ON companies FOR UPDATE USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'team')
);
CREATE POLICY "Team can delete companies" ON companies FOR DELETE USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'team')
);

-- Drives: anyone can read, team can CRUD
CREATE POLICY "Anyone can read drives" ON drives FOR SELECT USING (true);
CREATE POLICY "Team can insert drives" ON drives FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'team')
);
CREATE POLICY "Team can update drives" ON drives FOR UPDATE USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'team')
);
CREATE POLICY "Team can delete drives" ON drives FOR DELETE USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'team')
);

-- Offers: users can read own, team can CRUD
CREATE POLICY "Users read own offers" ON offers FOR SELECT USING (
  auth.uid() = user_id OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'team')
);
CREATE POLICY "Team can insert offers" ON offers FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'team')
);
CREATE POLICY "Team can update offers" ON offers FOR UPDATE USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'team')
);

-- ===================================
-- Seed data (optional — for testing)
-- ===================================

-- Insert sample jobs
INSERT INTO jobs (title, company, location, salary, type, category, description, requirements, responsibilities) VALUES
('Software Engineer', 'TechCorp', 'Bangalore', '12 LPA', 'Full-time', 'On-Campus',
 'We are looking for a skilled Software Engineer to join our dynamic team.',
 ARRAY['B.Tech in CSE or related', 'Proficiency in JavaScript, React, Node.js', 'Strong problem-solving skills'],
 ARRAY['Develop web applications', 'Collaborate with teams', 'Write clean code', 'Participate in code reviews']),
('Data Analyst', 'DataWiz', 'Hyderabad', '10 LPA', 'Full-time', 'On-Campus',
 'Join DataWiz to solve complex data problems and drive business decisions.',
 ARRAY['B.Tech in Statistics/Math', 'Experience with SQL and Python', 'Knowledge of Tableau/PowerBI'],
 ARRAY['Collect and analyze data', 'Create reports', 'Identify trends', 'Present findings']),
('Product Manager', 'InnovateX', 'Remote', '18 LPA', 'Full-time', 'On-Campus',
 'Lead product development at InnovateX with engineering and design teams.',
 ARRAY['MBA or equivalent', 'Product management experience', 'Strong leadership'],
 ARRAY['Define product vision', 'Manage roadmap', 'Prioritize features', 'Launch products']),
('Frontend Developer', 'WebSolutions', 'Pune', '8 LPA', 'Full-time', 'On-Campus',
 'Create beautiful user interfaces with responsive and interactive web pages.',
 ARRAY['B.Tech in CSE', 'HTML, CSS, JavaScript', 'React or Vue.js experience'],
 ARRAY['Implement user interfaces', 'Cross-browser compatibility', 'Optimize speed', 'Collaborate with backend']);

-- Insert sample companies
INSERT INTO companies (name, industry, contact, website, status) VALUES
('TechCorp', 'IT Services', 'hr@techcorp.com', 'techcorp.com', 'Active'),
('DataWiz', 'Analytics', 'jobs@datawiz.com', 'datawiz.com', 'Active'),
('InnovateX', 'Product', 'careers@innovatex.com', 'innovatex.com', 'Pending'),
('WebSolutions', 'Web Development', 'hr@websolutions.com', 'websolutions.com', 'Active');

-- Insert sample drives
INSERT INTO drives (company, role, drive_date, drive_time, venue, eligible, description, package) VALUES
('TechCorp', 'Software Engineer', '2025-05-25', '10:00 AM', 'Main Auditorium', 'CSE, ECE (CGPA > 8.0)',
 'TechCorp is hiring Software Engineers. Drive includes aptitude test, coding round, technical and HR interview.', '12 LPA'),
('DataWiz', 'Data Analyst', '2025-05-28', '09:30 AM', 'Seminar Hall 1', 'All Branches (CGPA > 7.5)',
 'DataWiz is looking for Data Analysts. Drive includes case study, group discussion, and two interview rounds.', '10 LPA');
