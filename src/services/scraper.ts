import * as cheerio from "cheerio";

// 1. Function to perform a Google Search (using fetch)
// Note: This relies on fetching Google HTML directly which can result in CAPTCHAs or blocks.
// For production stability, a SERP API is recommended as discussed in the implementation plan.
export async function searchGoogle(query: string, num: number = 20): Promise<string[]> {
    try {
        const url = `https://www.google.com/search?q=${encodeURIComponent(query)}&num=${num}`;

        // Use a generic User-Agent to avoid immediate blocks
        const response = await fetch(url, {
            headers: {
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
                "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8",
                "Accept-Language": "en-US,en;q=0.9",
            },
        });

        if (!response.ok) {
            console.error(`Google search failed with status: ${response.status}`);
            return [];
        }

        const html = await response.text();
        const $ = cheerio.load(html);

        const links: string[] = [];

        // Extract actual URLs from Google search result link containers
        $("a").each((i, element) => {
            let href = $(element).attr("href");

            if (href && href.startsWith("/url?q=")) {
                href = href.replace("/url?q=", "").split("&")[0];
            }

            if (href && href.startsWith("http") && !href.includes("google.com")) {
                // Clean URL to base domain
                try {
                    const urlObj = new URL(href);
                    const baseDomain = `${urlObj.protocol}//${urlObj.hostname}`;
                    if (!links.includes(baseDomain)) {
                        links.push(baseDomain);
                    }
                } catch (e) {
                    // ignore invalid URLs parsing errors
                }
            }
        });

        return links;
    } catch (error) {
        console.error("Error in searchGoogle:", error);
        return [];
    }
}

// 2. Function to extract email from a given URL
export async function extractEmailFromUrl(url: string): Promise<string | null> {
    try {
        const response = await fetch(url, {
            headers: {
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
            },
            signal: AbortSignal.timeout(5000), // 5 seconds timeout
        });

        if (!response.ok) return null;

        const html = await response.text();

        // Regex to find standard emails
        const emailRegex = /([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9_-]+)/gi;
        const matches = html.match(emailRegex);

        if (matches && matches.length > 0) {
            // Filter out common false positives (e.g. sentry, examples)
            const validEmails = matches.filter(e =>
                !e.includes("@example") &&
                !e.includes("@sentry") &&
                !e.endsWith(".png") &&
                !e.endsWith(".jpg")
            );

            if (validEmails.length > 0) {
                return validEmails[0].toLowerCase();
            }
        }

        return null;
    } catch (error) {
        console.error(`Error extracting email from ${url}:`, error);
        return null;
    }
}
