import fs from 'fs';
import path from 'path';

const directoryPath = path.join(process.cwd(), 'components', 'Mentorship');

function processFile(filePath) {
    let content = fs.readFileSync(filePath, 'utf8');
    let original = content;

    // First, strictly match multiline using regex:
    const multiLineRegex = /onUpdateMeetingData\(\{\s*\.\.\.meetingData,\s*([^]*?)\s*\}\);/g;
    content = content.replace(multiLineRegex, 'onUpdateMeetingData((prev: any) => ({ ...prev, $1 }));');

    // Then, match remaining single line
    const singleLineRegex = /onUpdateMeetingData\(\{\s*\.\.\.meetingData,\s*([^}]+)\s*\}\)/g;
    content = content.replace(singleLineRegex, 'onUpdateMeetingData((prev: any) => ({ ...prev, $1 }))');

    if (content !== original) {
        fs.writeFileSync(filePath, content, 'utf8');
        console.log(`Updated: ${filePath}`);
    }
}

function traverseDir(dir) {
    const files = fs.readdirSync(dir);
    for (const file of files) {
        const fullPath = path.join(dir, file);
        if (fs.statSync(fullPath).isDirectory()) {
            traverseDir(fullPath);
        } else if (fullPath.endsWith('.tsx') || fullPath.endsWith('.ts')) {
            processFile(fullPath);
        }
    }
}

traverseDir(directoryPath);
console.log('Update complete.');
