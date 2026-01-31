class WebRTCService {
  private peerConnection: RTCPeerConnection | null = null;
  private dataChannel: RTCDataChannel | null = null;

  async createOffer() {
    this.peerConnection = new RTCPeerConnection({
      iceServers: [{ urls: 'stun:stun.l.google.com:19302' }]
    });

    this.dataChannel = this.peerConnection.createDataChannel('git-sync');
    this.setupDataChannel();

    const offer = await this.peerConnection.createOffer();
    await this.peerConnection.setLocalDescription(offer);

    return JSON.stringify(offer);
  }

  async acceptOffer(offerStr: string) {
    const offer = JSON.parse(offerStr);
    this.peerConnection = new RTCPeerConnection({
      iceServers: [{ urls: 'stun:stun.l.google.com:19302' }]
    });

    this.peerConnection.ondatachannel = (event) => {
      this.dataChannel = event.channel;
      this.setupDataChannel();
    };

    await this.peerConnection.setRemoteDescription(offer);
    const answer = await this.peerConnection.createAnswer();
    await this.peerConnection.setLocalDescription(answer);

    return JSON.stringify(answer);
  }

  async acceptAnswer(answerStr: string) {
    if (!this.peerConnection) return;
    const answer = JSON.parse(answerStr);
    await this.peerConnection.setRemoteDescription(answer);
  }

  private setupDataChannel() {
    if (!this.dataChannel) return;

    this.dataChannel.onopen = () => console.log('Data channel open');
    this.dataChannel.onclose = () => console.log('Data channel closed');
    this.dataChannel.onmessage = (event) => {
      console.log('Received message:', event.data);
      // Handle Git packfile or JSON data
    };
  }

  send(data: string | ArrayBuffer | Blob | ArrayBufferView) {
    if (this.dataChannel && this.dataChannel.readyState === 'open') {
      this.dataChannel.send(data as any); // RTCDataChannel.send accepts these types, but TS definitions vary.
    }
  }
}

export const webRTCService = new WebRTCService();
