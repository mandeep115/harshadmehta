import React, { useState } from "react"

const proxy = "http://localhost:5000/"

const getUserInfo = async (userName, password) => {
  const response = await axios.get(proxy + '/user', {
    userName,
    password
  });
  const data = await response.json()
  console.log(data)
  return data
}

function App() {
  const [amountLeft, setAmountLeft] = useState(0)
  useEffect(() => {
    getUserInfo("Mandeep", "9011585051")
  }, [])
  return (
    <div>
      <header>
        <p>{amountLeft}</p>
      </header>
    </div>
  );
}
export default App;
