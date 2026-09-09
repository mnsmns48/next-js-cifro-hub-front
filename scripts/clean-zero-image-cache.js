const fs = require("fs");
const path = require("path");

const roots = [
    path.join(".next", "dev", "cache", "images"),
    path.join(".next", "cache", "images"),
];

function clean(dir) {
    if (!fs.existsSync(dir)) return;

    for (const name of fs.readdirSync(dir)) {
        const full = path.join(dir, name);
        let stat;

        try {
            stat = fs.statSync(full);
        } catch {
            continue;
        }

        if (stat.isDirectory()) {
            clean(full);
            continue;
        }

        if (stat.size === 0) {
            fs.unlinkSync(full);
        }
    }
}

for (const root of roots) {
    clean(root);
}
