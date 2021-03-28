const { execFile } = require("child_process");

/**
 * @param {string[]} args
 * @returns {Promise<[string, string]>}
 */
function execYtdl(...args) {
    return new Promise((resolve, reject) => {
        execFile("youtube-dl", args, (err, stdout, stderr) => {
            if (err) reject(err);
            resolve([stdout, stderr]);
        });
    });
}

/**
 * Given a YouTube video URL, return the direct video and audio URLs.
 * @param {string} youtubeUrl
 * @returns {Promise<[string, string]>}
 */
async function getUrls(youtubeUrl) {
    const [stdout] = await execYtdl("-g", youtubeUrl);
    return stdout.split("\n").slice(0, 2);
}

module.exports = {
    getUrls,
};
