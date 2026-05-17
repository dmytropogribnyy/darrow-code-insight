UPDATE generation_jobs SET status='queued', attempt_count=0, last_error=NULL, updated_at=now() WHERE id='9e5b8049-ecab-479e-828b-2a6e9daf8723';
UPDATE orders SET status='paid' WHERE id='38be4a2b-02ad-40fc-acba-4f7b8a4354c4';
UPDATE reports SET generation_status='processing' WHERE id='330145a1-1c91-467b-b605-f15d60765889';