import { AppBskyFeedDefs, BskyAgent, RichText } from "@atproto/api";
import axios from "axios";
import { bskyAccount, bskyService } from "./config.js";

export class ClimateHashBot {
  private agent: BskyAgent;

  constructor(service: string | URL) {
    this.agent = new BskyAgent({ service });
  }

  async login(): Promise<void> {
    try {
      await this.agent.login(bskyAccount);
      console.log("✅ Bot logged in successfully.");
    } catch (error) {
      console.error("❌ Login failed:", error);
    }
  }

  async postReply(originalPostUri: string, originalPostCid: string, text: string): Promise<void> {
    try {
      const richText = new RichText({ text });
      await richText.detectFacets(this.agent);

      await this.agent.post({
        text: richText.text,
        facets: richText.facets,
        reply: {
          root: { uri: originalPostUri, cid: originalPostCid },
          parent: { uri: originalPostUri, cid: originalPostCid },
        },
      });

      console.log(`✅ Replied to post: ${originalPostUri}`);
    } catch (error) {
      console.error("❌ Failed to reply:", error);
    }
  }

  extractUrl(text: string): string | null {
    const urlMatch = text.match(/https?:\/\/[^\s]+/);
    return urlMatch ? urlMatch[0] : null;
  }

  async fetchHashtags(text: string): Promise<string[]> {
    try {
      const response = await axios.post<{ response: string }>(
        "https://get-hashtag-7dgi4y93.uc.gateway.dev/hashbot",
        { url: text },
        { headers: { "Content-Type": "application/json" } }
      );

      return response.data.response.split("\n").map((tag) => tag.trim());
    } catch (error: any) {
      console.error("❌ Error fetching hashtags:", error.message);
      return [];
    }
  }

  async handleMention(post: { text: string; uri: string; cid: string }): Promise<void> {
    try {
      console.log(`📌 Fetching thread for post: ${post.uri}`);
      const threadResponse = await this.agent.getPostThread({ uri: post.uri });

      console.log("🔍 Thread response received.");

      const thread = threadResponse.data.thread;
      if (!thread || thread.$type !== "app.bsky.feed.defs#threadViewPost") {
        console.log(`❌ Thread is not a valid ThreadViewPost.`);
        return;
      }

      const originalPost = thread as AppBskyFeedDefs.ThreadViewPost;
      let originalText = (originalPost.post?.record as { text?: string })?.text || "";

      const hasOriginalHashtags = /#[\p{L}\p{N}_]+/u.test(originalText);
      if (hasOriginalHashtags) {
        console.log(`🔍 Original post already has hashtags. Skipping: ${post.uri}`);
        return;
      }

      // Check if bot has already replied
      const botDid = this.agent.session?.did;
      if (!botDid) {
        console.error("❌ Bot DID is not available.");
        return;
      }

      if (originalPost.replies?.some(reply => 
        reply.$type === "app.bsky.feed.defs#threadViewPost" &&
        (reply as AppBskyFeedDefs.ThreadViewPost).post?.author?.did === botDid
      )) {
        console.log(`🤖 Bot already replied. Skipping.`);
        return;
      }

      // Generate hashtags and reply
      console.log(`🔍 Mention detected without hashtags: ${post.text}`);
      const hashtags = await this.fetchHashtags(post.text);
      if (hashtags.length > 0) {
        const newText = `${post.text} ${hashtags.join(" ")}`;
        await this.postReply(post.uri, post.cid, newText);
      }
    } catch (error) {
      console.error("❌ Error handling mention:", error);
    }
  }

  async checkNotifications(): Promise<void> {
    try {
      const response = await this.agent.listNotifications();
      const notifications = response.data.notifications;

      for (const notif of notifications) {
        if (
          notif.reason === "mention" &&
          notif.record &&
          typeof (notif.record as any).text === "string" &&
          notif.author.did !== this.agent.session?.did // Ensure bot doesn’t reply to itself
        ) {
          console.log(`🔔 New mention detected: ${notif.uri}`);
          await this.handleMention({
            text: (notif.record as any).text,
            uri: notif.uri,
            cid: notif.cid,
          });
        }
      }
    } catch (error) {
      console.error("❌ Failed to fetch notifications:", error);
    }
  }

  async listenForMentions(): Promise<void> {
    await this.login();
    console.log("🚀 Bot is listening for mentions...");

    setInterval(async () => {
      await this.checkNotifications();
    }, 30000); // Check every 30 seconds
  }
}
