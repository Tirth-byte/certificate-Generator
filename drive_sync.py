import os
import mimetypes
import json
from google.oauth2 import service_account
from google.oauth2.credentials import Credentials
from google.auth.transport.requests import Request
from google_auth_oauthlib.flow import InstalledAppFlow
from googleapiclient.discovery import build
from googleapiclient.http import MediaFileUpload

# If modifying these scopes, delete the file token.json.
SCOPES = ['https://www.googleapis.com/auth/drive.file', 'https://www.googleapis.com/auth/drive.metadata.readonly']

class GoogleDriveSync:
    def __init__(self, credentials_path=None, token_path='token.json', interactive=False, method=None):
        self.service = None
        self.credentials_path = credentials_path
        self.interactive = interactive
        
        # Locate files in base directory
        base_dir = os.path.dirname(os.path.abspath(__file__))
        self.token_path = os.path.join(base_dir, token_path)
        
        # Determine method to use
        if not method:
            config_path = os.path.join(base_dir, 'config.json')
            if os.path.exists(config_path):
                try:
                    with open(config_path, 'r') as f:
                        cfg = json.load(f)
                        method = cfg.get("active_drive_method")
                except Exception:
                    pass
                    
        # Fallback defaults if no method specified
        if not method:
            if os.path.exists(os.path.join(base_dir, 'service_account.json')):
                method = 'service_account'
            elif os.path.exists(os.path.join(base_dir, 'credentials.json')):
                method = 'oauth'
                
        self.auth_type = method
        
        if method == 'service_account':
            self.credentials_path = os.path.join(base_dir, 'service_account.json')
        elif method == 'oauth':
            self.credentials_path = os.path.join(base_dir, 'credentials.json')
            
        if self.credentials_path and os.path.exists(self.credentials_path):
            self._authenticate()

    def _authenticate(self):
        """Authenticates with Google Drive API."""
        try:
            if self.auth_type == 'service_account':
                print("Authenticating with Google Drive Service Account...")
                creds = None
                
                # 1. Try loading from GOOGLE_SERVICE_ACCOUNT_JSON env var first
                sa_info_str = os.environ.get("GOOGLE_SERVICE_ACCOUNT_JSON")
                if sa_info_str:
                    try:
                        info = json.loads(sa_info_str)
                        creds = service_account.Credentials.from_service_account_info(
                            info, scopes=SCOPES
                        )
                        print("Successfully authenticated using GOOGLE_SERVICE_ACCOUNT_JSON environment variable.")
                    except Exception as e:
                        print(f"Failed to load service account credentials from environment: {e}")
                
                # 2. Fall back to local file if env var is not set or fails
                if not creds and self.credentials_path and os.path.exists(self.credentials_path):
                    print(f"Loading service account credentials from file: {self.credentials_path}")
                    creds = service_account.Credentials.from_service_account_file(
                        self.credentials_path, scopes=SCOPES
                    )
                
                if creds:
                    self.service = build('drive', 'v3', credentials=creds)
                else:
                    print("Google Drive Sync: Service account key is missing.")
                    self.service = None

            elif self.auth_type == 'oauth':
                print("Authenticating with Google Drive OAuth Client...")
                creds = None
                
                # 1. Try loading from GOOGLE_OAUTH_TOKEN_JSON env var first
                token_info_str = os.environ.get("GOOGLE_OAUTH_TOKEN_JSON")
                if token_info_str:
                    try:
                        info = json.loads(token_info_str)
                        creds = Credentials.from_authorized_user_info(info, SCOPES)
                        print("Successfully authenticated using GOOGLE_OAUTH_TOKEN_JSON environment variable.")
                    except Exception as e:
                        print(f"Failed to load OAuth token from environment: {e}")
                
                # 2. Fall back to local token.json file
                if not creds and os.path.exists(self.token_path):
                    try:
                        creds = Credentials.from_authorized_user_file(self.token_path, SCOPES)
                    except Exception:
                        pass
                
                # If there are no (valid) credentials available, let the user log in.
                if not creds or not creds.valid:
                    if creds and creds.expired and creds.refresh_token:
                        try:
                            creds.refresh(Request())
                            # Save updated credentials if we are local
                            try:
                                with open(self.token_path, 'w') as token:
                                    token.write(creds.to_json())
                            except Exception:
                                pass
                        except Exception:
                            creds = None
                    
                    if not creds or not creds.valid:
                        if not self.interactive:
                            print("Google Drive Sync: OAuth token missing or invalid. Requires interactive login.")
                            self.service = None
                            return
                            
                        # Run interactive local server for login (if running locally and interactive)
                        if self.credentials_path and os.path.exists(self.credentials_path):
                            flow = InstalledAppFlow.from_client_secrets_file(
                                self.credentials_path, SCOPES
                            )
                            creds = flow.run_local_server(port=0)
                            # Save the credentials for the next run
                            with open(self.token_path, 'w') as token:
                                token.write(creds.to_json())
                        else:
                            print("Google Drive Sync: OAuth credentials.json path is missing. Cannot perform interactive flow.")
                            self.service = None
                            return
                
                self.service = build('drive', 'v3', credentials=creds)
        except Exception as e:
            print(f"Google Drive Authentication failed: {e}")
            self.service = None

    def is_connected(self):
        """Returns True if Google Drive service is authenticated and ready."""
        return self.service is not None

    def find_or_create_folder(self, folder_name, parent_id=None):
        """Finds a folder by name or creates it if not found."""
        if not self.service:
            return None
            
        try:
            # Query to find folder
            query = f"name = '{folder_name}' and mimeType = 'application/vnd.google-apps.folder' and trashed = false"
            if parent_id:
                query += f" and '{parent_id}' in parents"
                
            results = self.service.files().list(
                q=query, spaces='drive', fields='files(id, name)'
            ).execute()
            
            items = results.get('files', [])
            
            if items:
                # Folder already exists
                return items[0]['id']
            
            # Create folder
            folder_metadata = {
                'name': folder_name,
                'mimeType': 'application/vnd.google-apps.folder'
            }
            if parent_id:
                folder_metadata['parents'] = [parent_id]
                
            folder = self.service.files().create(
                body=folder_metadata, fields='id'
            ).execute()
            
            print(f"Created Google Drive Folder: '{folder_name}' with ID: {folder['id']}")
            return folder['id']
            
        except Exception as e:
            print(f"Error finding/creating Google Drive folder '{folder_name}': {e}")
            return None

    def upload_file(self, file_path, folder_id=None):
        """Uploads a file to Google Drive under a specific folder."""
        if not self.service:
            return None
            
        try:
            file_name = os.path.basename(file_path)
            
            # Query if file already exists in folder to update instead of duplicate
            query = f"name = '{file_name}' and trashed = false"
            if folder_id:
                query += f" and '{folder_id}' in parents"
                
            results = self.service.files().list(
                q=query, spaces='drive', fields='files(id)'
            ).execute()
            
            items = results.get('files', [])
            
            mime_type, _ = mimetypes.guess_type(file_path)
            if not mime_type:
                mime_type = 'application/octet-stream'
                
            media = MediaFileUpload(file_path, mimetype=mime_type, resumable=True)
            
            if items:
                # Update existing file
                file_id = items[0]['id']
                file = self.service.files().update(
                    fileId=file_id, media_body=media, fields='id, webViewLink'
                ).execute()
                print(f"Updated Google Drive File: '{file_name}'")
            else:
                # Create new file
                file_metadata = {'name': file_name}
                if folder_id:
                    file_metadata['parents'] = [folder_id]
                    
                file = self.service.files().create(
                    body=file_metadata, media_body=media, fields='id, webViewLink'
                ).execute()
                
                # Make file readable to anyone with link (optional/convenient for downloads)
                try:
                    user_permission = {
                        'type': 'anyone',
                        'role': 'reader',
                    }
                    self.service.permissions().create(
                        fileId=file['id'],
                        body=user_permission,
                        fields='id',
                    ).execute()
                except Exception:
                    pass
                
                print(f"Uploaded new Google Drive File: '{file_name}'")
                
            return file.get('webViewLink')
            
        except Exception as e:
            print(f"Error uploading file '{file_path}' to Google Drive: {e}")
            return None
