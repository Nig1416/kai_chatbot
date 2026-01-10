import fs from 'fs/promises';

async function checkMemory() {
    try {
        const data = await fs.readFile('database.json', 'utf-8');
        const db = JSON.parse(data);

        console.log("\n🧠 **Active Long-Term Memory Storage**");
        console.log("===================================");

        if (db.users.length === 0) {
            console.log("No users found yet. (Chat with the bot to create memories!)");
        } else {
            db.users.forEach(user => {
                console.log(`\nUser ID: ${user.userId}`);
                console.log(`Facts Stored: ${user.facts.length}`);
                if (user.facts.length > 0) {
                    console.log("-------------------");
                    user.facts.forEach(f => console.log(`• ${f}`));
                } else {
                    console.log("(No facts extracted yet - Try telling it your name or hobbies)");
                }
            });
        }
    } catch (e) {
        console.log("Error reading DB:", e.message);
    }
}

checkMemory();
