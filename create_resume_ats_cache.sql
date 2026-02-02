-- Create resume_ats_cache table if it doesn't exist
create table if not exists resume_ats_cache (
  id uuid default gen_random_uuid() primary key,
  resume_id uuid references resumes(id) on delete cascade not null,
  ats_score integer not null,
  analysis_data jsonb not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Add index on resume_id and created_at for faster lookups
create index if not exists idx_resume_ats_cache_resume_id on resume_ats_cache(resume_id);
create index if not exists idx_resume_ats_cache_created_at on resume_ats_cache(created_at);

-- Enable RLS
alter table resume_ats_cache enable row level security;

-- Create policy for users to see their own resume caches (via resume ownership)
create policy "Users can view their own resume caches"
  on resume_ats_cache for select
  using (
    exists (
      select 1 from resumes
      where resumes.id = resume_ats_cache.resume_id
      and resumes.user_id = auth.uid()
    )
  );

-- Create policy for users to insert their own resume caches
create policy "Users can insert their own resume caches"
  on resume_ats_cache for insert
  with check (
    exists (
      select 1 from resumes
      where resumes.id = resume_ats_cache.resume_id
      and resumes.user_id = auth.uid()
    )
  );
