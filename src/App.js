import './reset.css';
import './App.css';
import {useState} from "react";

function App() {

  const [guildName, setGuildName] = useState("");
  const WORLDLIST = [
    "스카니아", "베라", "루나", "제니스", "크로아", 
    "유니온", "엘리시움", "이노시스", "레드", "오로라", 
    "아케인", "노바", "리부트", "리부트2", "버닝", "버닝2", "버닝3"
  ]
  const [worldName, setWorldName] = useState("");
  const [guildMember, setGuildMember] = useState([]);
  const DATE = "2023-12-28"
  const getGuildInfo = async (e) => {
    e.preventDefault();
    if (!guildName || !worldName ) {
      return;
    }

    // Guild ID 식별자 조회
    const params1 = {
      guild_name: guildName,
      world_name: worldName,
    };
    const guildId = await sendRequest("guild/id?", params1);
    console.log(guildId);


    // Guild 정보 조회
    const params2 = {
      oguild_id: guildId.oguild_id,
      date: DATE,
    }
    const guildInfo = await sendRequest("guild/basic?", params2);
    console.log(guildInfo);
    const guild_member = guildInfo.guild_member;

    let guild_memberInfo = [];
    for (let i = 0; i < guild_member.length; i++) {

      // 길드원 ID 식별자 조회
      const params3 = {
        character_name: guild_member[i]
      }
      const memberId = await sendRequest("id?", params3);

      // 길드원 정보 조회
      const params4 = {
        ocid: memberId.ocid,
        date: DATE
      }
      const memberInfo = await sendRequest("character/stat?", params4);
      const memberInfo2 = await sendRequest("character/basic?", params4);
      // eslint-disable-next-line no-new-object

      let userInfo = new Object();
      try {
        if ( memberInfo.final_stat.length > 0 ) {
          let power =  memberInfo.final_stat.find(obj => obj.stat_name === "전투력")
          userInfo["power"] = power.stat_value;
        } else {
          userInfo["power"] = 0;
        }
        userInfo["name"] = guild_member[i];
        userInfo["job"] = memberInfo2.character_class;
        userInfo["level"] = memberInfo2.character_level;
        userInfo["imgUrl"] = memberInfo2.character_image;
        guild_memberInfo.push(userInfo);

        console.log(i+1,"번째 길드원 검색완료 ");
        console.log("해당 길드원 정보 : ", userInfo);
      } catch (e) {
        console.log(e);
      }
    }
    console.log(guild_memberInfo);
    // 정렬
    guild_memberInfo.sort((a, b) => b.power - a.power);
    setGuildMember(guild_memberInfo);
  }  
  
  // hook
  const sendRequest = (url, params) => {
    const baseURL = "https://open.api.nexon.com/maplestory/v1/";
    const apiKey = "live_544ff5c995310beebf3a58070eec5b0d6fac91c29fb8e9ae7c2ffa015e84d73253e8274577a7ff33bcf0125491d1948f";
    const headers = {
      "x-nxopen-api-key" : apiKey,
    }
    const queryString = new URLSearchParams(params).toString();
    let urlString = baseURL + url + queryString;
   
    const responseData = fetch(urlString, {
      headers : headers
    })
    .then((res) => {
      const data = res.json()
      return data;
    })
    .catch((err) => {
      console.log(err)
      return null;
    })
    .finally(() => {

    });
    return responseData;
  };

  return (
    <div className="App">
      <div>
        <p className='title'>길드내 전투력 랭킹조회</p>
        <div className='input_box'>
          <div className='select_type mr2'>
            <select
              className='select'
              onChange={(e) => {
                setWorldName(e.target.value);
              }}
            >
              {WORLDLIST &&
                WORLDLIST.map((item, idx) => {
                  return (
                    <option key={'world' + idx} value={item}>
                      {item}
                    </option>
                  );
              })}
            </select>
          </div>
          <input className='textInput mr2' placeholder='길드명을 입력해주세요.' onChange={(e) => setGuildName(e.target.value)}/>
          <button className='btn_sm btn_primary' onClick={getGuildInfo}>조회</button>
        </div>
        

        <div className='table_wrap'>
          <div className='custom_tb4'>
            <table>
              <colgroup>
                <col width="40"/><col/><col/>
              </colgroup>
              <thead>
                <tr>
                  <th>#</th>
                  <th>캐릭터</th>
                  <th>전투력</th>
                </tr>
              </thead>
              <tbody>
              {guildMember && guildMember.map((item, index) => {
                return (
                  <tr key={index}>
                    {
                      index === 0
                      ?
                        <td>
                          <div className='first'>1</div>
                        </td>
                      : null
                    }
                    {
                      index === 1
                      ?
                        <td>
                          <div className='second'>2</div>
                        </td>
                      : null
                    }
                    {
                      index === 2
                      ?
                        <td>
                          <div className='third'>3</div>
                        </td>
                      : null
                    }
                    {
                      index !== 0 && index !== 1 && index !== 2
                      ?
                        <td>{index + 1}</td>
                      : null
                    }
                    <td className='sentence'>
                      <div className='character_box'>
                        <img src={item.imgUrl} alt={item.name}/>
                        <div className='name_info'>
                          <div className='font_sm'>Lv. {item.level}</div>
                          <div className='font_sm'>{item.job}</div>
                          <a href={'https://maple.gg/u/' + item.name}>{item.name}</a>
                        </div>
                      </div>
                    </td>
                    <td>{item.power.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")}</td>
                  </tr>
                )
              })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
        
    </div>
  );
}

export default App;
