import React from 'react';
import './App.css';
import Title from './components/Title.js';

const jsonLocalStorage = {
  setItem: (key, value) => {
  localStorage.setItem(key, JSON.stringify(value));
  },
  getItem: (key) => {
  return JSON.parse(localStorage.getItem(key));
  },
  };
  
// 2022.05.29 기존 API 불안정으로 다른 API로 대체함
const fetchCat = async (text) => {
  // const OPEN_API_DOMAIN = "https://cataas.com";
  // const response = await fetch(
  //     `${OPEN_API_DOMAIN}/cat/says/${text}?json=true`
  // );
  // const responseJson = await response.json();
  // return `${OPEN_API_DOMAIN}/${responseJson.url}`;

  const response = await fetch(
      `https://api.thecatapi.com/v1/images/search`
  );

  const responseJson = await response.json();

  return responseJson[0].url;
};

  

  const Form = ({updateMainCat}) => {
    const [value, setValue] = React.useState('');
    const includesHangul = (text) => /[ㄱ-ㅎ|ㅏ-ㅣ|가-힣]/i.test(text);
    const [errorMessage, setErrorMessage] = React.useState(''); 

    function handleInputChange(e) {          
      const userValue = e.target.value;

      if (includesHangul(userValue)) {
        setErrorMessage('한글은 입력하실 수 없습니다.')
      } else {
        setErrorMessage('');
      }

      setValue(userValue.toUpperCase())
    }
    
    function handleOnSubmit(e) {
      e.preventDefault();

      setErrorMessage('');
      if (value === '') {
        setErrorMessage('빈 값으로 만들 수 없습니다.');
        return;
      }

      updateMainCat(value);
    }

    return (
      <form onSubmit={handleOnSubmit}>
        <input 
          type="text" 
          name="name" 
          placeholder="영어 대사를 입력해주세요" 
          onChange={handleInputChange}
          value={value}
          />
        <button type="submit">생성</button>
        <p style={{color:'red'}}>{errorMessage}</p>
    </form>
    )
  }
  
  function CatItem(props) {
    return (
      <li>
        <img src={props.img} alt="cat" style={{width:'150px'}} />  
      </li>
    )
  };
  
  function Favorites({favorites}) {
    if(favorites.length === 0) {
      return <div>사진 위 하트를 눌러 고양이 사진을 저장해봐요!</div>
    }

    return (
      <ul className="favorites">
        {favorites.map((cat) => (
          <CatItem img={cat} key={cat}/>
        ))}
    </ul>
    )
  }

  const MainCard = ({img, alt, width, onHeartClick, alreadyFavorite}) => {
    const heartIcon = alreadyFavorite ? "💖" : "🤍";

    return (
      <div className="main-card">
      <img
        src = {img}
        alt= {alt}
        width= {width}
      />
      <button 
        onClick={onHeartClick}>{heartIcon}</button>
    </div>
    )
  }
  
  const App = () => {
    const CAT1 = "https://cataas.com/cat/60b73094e04e18001194a309/says/react";

    const [counter, setCounter] = React.useState( () => {
      return jsonLocalStorage.getItem("counter");
    });

    const [mainCat, setMainCat] = React.useState(CAT1);

    const [favorites, setFavorite] = React.useState(()=> {
      return jsonLocalStorage.getItem("favorites") || [];
    });

    async function setInitalCat() {
      const newCat = await fetchCat('First cat');
      setMainCat(newCat);
    };
    
    // 
    const alreadyFavorite = favorites.includes(mainCat);

    React.useEffect(()=> {
      setInitalCat();
    }, []);

    async function updateMainCat(value) {
      const newCat = await fetchCat(value);

      setMainCat(newCat);
      
      setCounter((prev)=> {
        const nextCounter = prev + 1;
        jsonLocalStorage.setItem('counter', nextCounter);
        return nextCounter;
      });
    };

    // 하트 클릭 시 중복이 되고 localstorage에서 error 발생. 수정 필요
    function onHeartClick() {
      try {
          //  수정. 이미 하트가 찍혀있을 경우 return;
          if (alreadyFavorite === true) {
              return;
          }

          const nextFavorites = [...favorites, mainCat];

          console.log(nextFavorites);

          setFavorite(nextFavorites);
          jsonLocalStorage.setItem("favorites", nextFavorites);
          console.log("click");
      } catch (error) {
          console.error("error : ", error);
      }
  }

    const counterTitle = counter === null ? "" : counter+ "번째 ";

    return (
    <div>
      <Title>{counterTitle}고양이 가라사대</Title>
      <Form updateMainCat={updateMainCat}/>
      <MainCard 
        img={mainCat} 
        alt ="고양이"  
        width="400" onHeartClick={onHeartClick}
        alreadyFavorite = {alreadyFavorite}
        />
      <Favorites favorites={favorites}/>
    </div>
    )
  };

export default App;

// import, export
// 파일을 모듈처럼 가져오고 내보내는 문법