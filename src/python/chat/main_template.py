import pipeline

try:
    pipeline.chat_send(
        pipeline_id=0,
        user_message="",
    )
except Exception:
    import traceback

    print(traceback.format_exc())
