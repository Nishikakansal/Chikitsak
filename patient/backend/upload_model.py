import os
import sys
from huggingface_hub import HfApi

def upload():
    # Path to local model directory
    local_dir = os.path.join(os.path.dirname(__file__), "chikitsak_triage_model")
    repo_id = "Nishikakansal/chikitsak-triage-model"

    if not os.path.exists(local_dir):
        print(f"Error: Local model directory not found at {local_dir}")
        return

    # Check for Hugging Face token
    token = os.environ.get("HF_TOKEN")
    if not token:
        print("HF_TOKEN environment variable not set.")
        token = input("Please enter your Hugging Face write token (get one from https://huggingface.co/settings/tokens): ").strip()

    if not token:
        print("Error: Hugging Face token is required to upload files.")
        return

    api = HfApi()
    try:
        print(f"Uploading files from '{local_dir}' to '{repo_id}'...")
        api.upload_folder(
            folder_path=local_dir,
            repo_id=repo_id,
            token=token,
            commit_message="Upload fine-tuned DistilBERT model files"
        )
        print("Upload completed successfully!")
    except Exception as e:
        print(f"Upload failed: {e}")

if __name__ == "__main__":
    upload()
