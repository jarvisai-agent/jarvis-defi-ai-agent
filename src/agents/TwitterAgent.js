// State management for Twitter Agent
export class TwitterAgentState {
  constructor() {
    this.isWaiting = false;
    this.content = '';
  }

  setWaiting(value) {
    this.isWaiting = value;
  }

  setContent(value) {
    this.content = value;
  }

  reset() {
    this.isWaiting = false;
    this.content = '';
  }
}

// Command handling for Twitter Agent
export class TwitterAgent {
  constructor(setState, speakText) {
    this.state = new TwitterAgentState();
    this.setState = setState;
    this.speakText = speakText;
  }

  // Check if it's a Twitter command
  isTwitterCommand(command) {
    const normalizedCommand = command.toLowerCase().trim();
    return normalizedCommand.includes('tweet') || normalizedCommand.includes('twitter');
  }

  // Handle tweet command
  handleCommand() {
    console.log('Executing tweet command, setting waiting state to true');
    this.state.setWaiting(true);
    const response = 'Sure, what would you like to tweet?';
    return response;
  }

  // Send tweet
  async sendTweet(content) {
    try {
      console.log('Sending tweet:', content);
      // In actual project, Twitter API call would go here
      const response = `I've sent your tweet: "${content}"`;
      this.state.reset();
      return response;
    } catch (error) {
      console.error('Failed to send tweet:', error);
      throw new Error('Failed to send tweet');
    }
  }

  // Handle tweet content
  async handleContent(content) {
    try {
      const response = await this.sendTweet(content);
      return response;
    } catch (error) {
      return "Sorry, failed to send the tweet.";
    }
  }

  // Get current state
  isWaiting() {
    return this.state.isWaiting;
  }
} 