const { execSync } = require('child_process');
const commits = ['HEAD', '549522a', 'f89f566', '88a260b', '86c0e3d', '3f92b11', '1ff7454', '0f7de0d', 'd32d53e', '83f123a'];
commits.forEach(c => {
  try {
    const content = execSync(`git show ${c}:channels_data.js`, { encoding: 'utf8' });
    const match = content.match(/id:\s*['"]ch-/g);
    console.log(c, 'channels count in channels_data.js:', match ? match.length : 0, 'lines:', content.split('\n').length);
  } catch(e) {
    console.log(c, 'error', e.message);
  }
});
