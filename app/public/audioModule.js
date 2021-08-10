class audioModule extends AudioWorkletProcessor {
  constructor (...args) {
    super(...args)
    this.volume = 0.0;
    this.timer = 50;
  }
  process (inputs, outputs, parameters) {
    const input = inputs[0];
    if(input.length > 0){
      const samples = input[0];
      let sum = 0.0;

      for(let i=0; i < samples.length; ++i){
        sum += samples[i]*samples[i];
      }

      this.volume = Math.sqrt(sum / samples.length);
      this.timer -= 1;

      if(this.timer <= 0){ 
        this.port.postMessage({volume: this.volume})
        this.timer = 50;
      }
    }
  
    return true;
  }
}

registerProcessor('audioModule', audioModule);