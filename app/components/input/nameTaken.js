const nameTaken = async (uName, endpoint) => {
    let res = await fetch(`${endpoint}/name`, {
      method: "POST",
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({name: uName})
    }).then(response => response.json())
      .then((body) => {
        return body;
      });
    return res;
}

export default nameTaken;