import https from 'https';
import fs from 'fs';
import path from 'path';

const url = 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/1d/Lambang_Kabupaten_Buton_Selatan.png/600px-Lambang_Kabupaten_Buton_Selatan.png';
const publicDir = path.join(process.cwd(), 'public');
const dest = path.join(publicDir, 'logo.png');

if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir, { recursive: true });
}

const options = {
  headers: {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
  }
};

https.get(url, options, (res) => {
  if (res.statusCode === 200) {
    const file = fs.createWriteStream(dest);
    res.pipe(file);
    file.on('finish', () => {
      file.close();
      console.log('Logo downloaded successfully to public/logo.png');
    });
  } else {
    console.error('Failed to download, status code:', res.statusCode);
  }
}).on('error', (err) => {
  console.error('Error downloading:', err.message);
});
