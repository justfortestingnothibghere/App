async function uploadFile() {
  const fileInput = document.getElementById('fileInput');
  const isPublic = document.getElementById('isPublic').checked;
  const userId = 'user123'; // Replace with actual user ID from auth
  const formData = new FormData();
  formData.append('file', fileInput.files[0]);
  formData.append('userId', userId);
  formData.append('isPublic', isPublic);

  const response = await fetch('/api/files/upload', {
    method: 'POST',
    body: formData
  });
  const data = await response.json();
  alert(`File uploaded! Access link: ${data.accessLink}`);
  loadFiles();
}

async function redeemKey() {
  const key = document.getElementById('keyInput').value;
  const userId = 'user123'; // Replace with actual user ID
  const response = await fetch('/api/files/redeem', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userId, key })
  });
  const data = await response.json();
  alert(data.message);
}

async function loadFiles() {
  const userId = 'user123'; // Replace with actual user ID
  const response = await fetch(`/api/files?userId=${userId}`);
  const files = await response.json();
  const fileList = document.getElementById('fileList');
  fileList.innerHTML = '';
  files.forEach(file => {
    const li = document.createElement('li');
    li.innerHTML = `
      ${file.filename} (${file.isPublic ? 'Public' : 'Private'})
      <div>
        <a href="${file.accessLink}" target="_blank">Access</a>
        <button onclick="togglePublic('${file._id}')">Toggle Public</button>
        <button onclick="shareLink('${file.accessLink}')">Share</button>
      </div>
    `;
    fileList.appendChild(li);
  });
}

async function togglePublic(fileId) {
  await fetch(`/api/files/toggle/${fileId}`, { method: 'PUT' });
  loadFiles();
}

function shareLink(link) {
  navigator.clipboard.writeText(link);
  alert('Link copied to clipboard!');
}

document.addEventListener('DOMContentLoaded', loadFiles);