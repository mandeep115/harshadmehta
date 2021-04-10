import React, { useEffect, useState } from "react"
import axios from "axios"
import "./App.css"

const proxy = "http://localhost:5000"

const getCompanies = async () => {
  const response = await axios.get(proxy + "/get-companies")
  return response.data
}

const getRound = async () => {
  const response = await axios.get(proxy + "/get-round")
  console.log(response.data)
  return response.data
}

const getUserInfo = async (userName, password) => {
  const response = await axios.post(proxy + '/auth', {
    userName,
    password
  });
  const data = response.data
  // console.log(data)
  return data
}

const buyShare = async (userName, company, shares) => {
  const response = await axios.post(proxy + '/buy', {
    userName,
    company,
    shares
  })
  return response.data
}
const sellShare = async (userName, company, shares) => {
  const response = await axios.post(proxy + '/sell', {
    userName,
    company,
    shares
  })
  return response.data
}

function Item({ name, img, shareCount, basePps, pps: currentPps, sharesLeft, round, user, handleSubmit }) {
  const [sharesToBuy, setSharesToBuy] = useState(0)
  const handleShareChange = (event) => {
    if (event.target.value > sharesLeft || event.target.value < 0) return
    setSharesToBuy(event.target.value)
  }
  const [isDisabled, setIsDisabled] = useState(false)
  useEffect(() => {
    if (!user[name] && round == 2) {
      setIsDisabled(true)
    }
  }, [])

  return (
    <div style={{ minHeight: '150px', width: '200px', }}>
      <img src={img} alt={name} loading="lazy" style={{ objectFit: 'contain', height: '120px', maxWidth: '100%' }} />
      <h3>{name}</h3>
      <p>Share Count {shareCount}</p>
      <p>Base price per share {basePps}</p>
      <p>Current price per share <b>{currentPps}</b></p>
      <p>
        <b>Shares Available {sharesLeft}</b>
      </p>
      <label htmlFor="shareCount">Enter number of shares.</label>
      <input onChange={handleShareChange} value={sharesToBuy} style={{ margin: '10px 0' }} type="number" placeholder="Enter Shares" name="shareCount" id="shareCount" />
      <button disabled={isDisabled} onClick={() => {
        setIsDisabled(true)
        handleSubmit(parseInt(sharesToBuy), name).then(_ => setIsDisabled(false))
        setSharesToBuy(0)
      }} style={{ textTransform: 'capitalize' }}>{round == 2 ? 'sell' : 'buy'}</button>
    </div>
  )
}


function App() {
  const [userName, setUserName] = useState("")
  const [password, setPassword] = useState("")
  const [passFieldType, setPassFieldType] = useState("password")
  const [error, setError] = useState("")
  const [user, setUser] = useState(null)
  const [amountLeft, setAmountLeft] = useState(0)
  const [companies, setCompanies] = useState([])
  const [round, setRound] = useState(0)


  useEffect(() => {
    // getUserInfo("Mandeep", "9011585051").then((data) => setAmountLeft(data.moneyLeft))
    let tempuser = JSON.parse(localStorage.getItem('user'))
    if (tempuser) getUserInfo(tempuser.userName, tempuser.password).then(data => setUser(data))
    getRound().then(round => setRound(parseInt(round)))
    getCompanies().then((data) => setCompanies(data))
    setInterval(() => {
      getCompanies().then((data) => setCompanies(data))
    }, 10000);
    setTimeout(() => {
      getRound().then(data => setRound(data))
    }, 30000);
  }, [])
  useEffect(() => {
    setAmountLeft(user?.moneyLeft)
  }, [user])
  const verifyData = () => {
    if (password.length !== 10) {
      setError("Enter Valid Password")
      setTimeout(() => {
        setError("")
      }, 6000);
    }
  }
  const handleSubmit = (event) => {
    event.preventDefault()
    verifyData()
    getUserInfo(userName, password).then((data) => {
      setUser(data)
      console.log(data)
      setAmountLeft(data.moneyLeft)
      localStorage.setItem('user', JSON.stringify(data))
    })
  }
  const handleBuySell = async (sharesToBuy, name) => {
    let data;
    if (round == 2) {
      data = await sellShare(user.userName, name, sharesToBuy)
    }
    else {
      data = await buyShare(user.userName, name, sharesToBuy)
    }
    setUser(data.user)
    getCompanies().then(companies => setCompanies(companies))
  }
  if (user) return (
    <div className="App">
      <header style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '40px' }}>
        <label>Current Amount {amountLeft}</label>
        <label>Current Round {round}</label>
        <label>Hello, {user?.userName.split("@")[0]}</label>
      </header>
      <main style={{ display: 'flex', flexWrap: 'wrap', gap: '40px' }}>
        {
          companies?.map((company) => (
            <Item img={company.img}
              name={company.company} pps={company.currentPps}
              basePps={company.basePrice} shareCount={company.totalShares} sharesLeft={company.shareLeft}
              round={round}
              user={user}
              handleSubmit={handleBuySell}
            />
          ))
        }
      </main>
      {/* <footer>
        {Object.keys(user).map((key) => {
          if (key === 'userName' && key === 'password' && key === 'moneyLeft' && key === '_id') return null
          return `${key}`
        })}
      </footer> */}
    </div >
  )
  return (
    <div className="App">
      <main>
        <form method="post" onSubmit={handleSubmit}>
          <label htmlFor="userName">User Name</label>
          <input style={{ padding: '10px', margin: '10px' }} placeholder="User name" value={userName} onChange={(event) => setUserName(event.target.value)} type="text" name="userName" id="userName" />
          <label htmlFor="password">Password</label>
          <input style={{ padding: '10px', margin: '10px' }} placeholder={`Password (${(passFieldType === "password") ? "hidden" : "visible"})`} value={password} onChange={(event) => setPassword(event.target.value)} type={passFieldType} name="password" id="password" />
          <button onClick={(event) => { event.preventDefault(); passFieldType == "password" ? setPassFieldType("text") : setPassFieldType("password") }}>toggle password</button>
          <p>Your mobile number without +91 or 0.</p>
          <p style={{ color: "red" }}>{error}</p>
          <input type="submit" value="Login" />
        </form>
      </main>
    </div>
  );
}
export default App;
