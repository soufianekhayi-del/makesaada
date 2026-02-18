
import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method Not Allowed' });
    }

    try {
        const { url } = req.body;

        if (!url) {
            return res.status(400).json({ error: 'URL is required' });
        }

        // 1. Follow Redirects to get full URL (using fetch with redirect: 'follow')
        const response = await fetch(url, { method: 'HEAD', redirect: 'follow' });
        const finalUrl = response.url;

        let lat: number | null = null;
        let lng: number | null = null;

        // 2. Regex Strategies for Maps URLs

        // Pattern A: @lat,lng (most common in desktop/expanded links)
        // https://www.google.com/maps/place/.../@33.5731,-7.5898,15z/...
        const atRegex = /@(-?\d+\.\d+),(-?\d+\.\d+)/;
        const atMatch = finalUrl.match(atRegex);
        if (atMatch) {
            lat = parseFloat(atMatch[1]);
            lng = parseFloat(atMatch[2]);
        }

        // Pattern B: ?q=lat,lng (search query)
        if (!lat) {
            const qRegex = /[?&]q=(-?\d+\.\d+),(-?\d+\.\d+)/;
            const qMatch = finalUrl.match(qRegex);
            if (qMatch) {
                lat = parseFloat(qMatch[1]);
                lng = parseFloat(qMatch[2]);
            }
        }

        // Pattern C: 3dlat!4dlong (data parameters in huge URLs)
        if (!lat) {
            const dataRegex = /!3d(-?\d+\.\d+)!4d(-?\d+\.\d+)/;
            const dataMatch = finalUrl.match(dataRegex);
            if (dataMatch) {
                lat = parseFloat(dataMatch[1]);
                lng = parseFloat(dataMatch[2]);
            }
        }

        if (lat && lng) {
            return res.status(200).json({
                lat,
                lng,
                label: 'Shared Location'
            });
        } else {
            return res.status(422).json({ error: 'Could not extract coordinates from this link' });
        }

    } catch (error) {
        console.error("Parse location error:", error);
        return res.status(500).json({ error: 'Failed to resolve link' });
    }
}
