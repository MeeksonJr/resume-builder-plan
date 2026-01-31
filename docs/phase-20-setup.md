# Phase 20 Setup & Verification Guide

## Prerequisites
- [ ] Groq API key (FREE - get from https://console.groq.com/)
- [ ] Supabase project access
- [ ] Development server running

## Step 1: Environment Setup

1. Add your Groq API key to `.env.local`:
   ```bash
   GROQ_API_KEY=your_key_here
   ```

   **Get your FREE API key:**
   - Visit https://console.groq.com/
   - Sign up (no credit card required!)
   - Generate an API key
   - Groq offers a generous free tier with fast inference

2. Verify all environment variables are set (see `.env.example`)

## Step 2: Database Migration

### Option A: Using Supabase CLI
```bash
supabase migration up
```

### Option B: Manual via Dashboard
1. Open Supabase Dashboard → SQL Editor
2. Copy contents from `supabase/migrations/20260131_interview_answers.sql`
3. Run the migration
4. Verify tables created:
   - `interview_answers`
   - `interview_feedback`

## Step 3: Verification Tests

### Test 1: Basic Flow
1. Navigate to `/dashboard/interview-prep`
2. Create or select a practice session
3. Answer a question
4. Verify answer submission works
5. Check that evaluation display appears
6. Review feedback quality

### Test 2: Database Verification
Run these queries in Supabase SQL Editor:

```sql
-- Check tables exist
SELECT * FROM interview_answers LIMIT 1;
SELECT * FROM interview_feedback LIMIT 1;

-- Verify RLS policies
SELECT tablename, policyname 
FROM pg_policies 
WHERE tablename IN ('interview_answers', 'interview_feedback');
```

### Test 3: API Endpoints
Using the browser developer console on the practice page:

```javascript
// Test answer submission
const response = await fetch('/api/interview/answers', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    questionId: 'your-question-id',
    sessionId: 'your-session-id',
    answerText: 'This is a test answer with more than 50 characters to pass validation.'
  })
});
const data = await response.json();
console.log('Answer ID:', data.answer.id);

// Test evaluation
const evalResponse = await fetch(`/api/interview/answers/${data.answer.id}/evaluate`, {
  method: 'POST'
});
const feedback = await evalResponse.json();
console.log('Feedback:', feedback);
```

### Test 4: Component Features
- [ ] Timer starts and displays duration
- [ ] Textarea auto-resizes as you type
- [ ] Ctrl+Enter submits the answer
- [ ] Character count updates
- [ ] Submit button disabled until 50 characters
- [ ] Loading state shows during evaluation
- [ ] Score card displays with correct color
- [ ] All feedback sections render
- [ ] "Try Different Answer" button works
- [ ] Navigation between questions preserves state

## Step 4: Quality Checks

Test with different answer qualities:

### Good Answer Example:
```
In my previous role as a software engineer, I faced a critical bug (Situation) 
that was causing data loss in production. My task was to identify and fix it 
within 24 hours (Task). I systematically debugged the code, identified a race 
condition, implemented a fix with proper locking mechanisms, and added 
comprehensive tests (Action). The fix was deployed successfully with zero 
downtime, and we prevented future data loss incidents (Result).
```

Expected: Score 8-10, specific strengths identified

### Weak Answer Example:
```
I fixed a bug once. It was hard but I did it. Everything worked after.
```

Expected: Score 3-5, constructive feedback, actionable improvements

## Common Issues

### Issue: "Failed to evaluate answer"
**Solution**: Check that `GROQ_API_KEY` is set correctly in `.env.local`

### Issue: Database errors on submission
**Solution**: Verify migration ran successfully and RLS policies are in place

### Issue: Compilation errors
**Solution**: Restart dev server after installing dependencies:
```bash
pnpm dev
```

### Issue: Evaluation takes too long
**Normal**: Groq is typically very fast (1-3 seconds). If it's slower, check your internet connection.

## Success Criteria

✅ Answer submission creates database record
✅ Evaluation generates AI feedback
✅ Score reflects answer quality
✅ Feedback is specific and actionable
✅ UI updates smoothly without errors
✅ Timer tracks answer duration
✅ Progress tracking works across questions

## Next Steps After Verification

1. Test with real interview questions
2. Refine evaluation prompts if needed
3. Add answer history view (future enhancement)
4. Consider adding export functionality
5. Implement analytics for tracking improvement over time
