const ACCESS_KEY = import.meta.env.VITE_APP_ACCESS_KEY;

import { useState, useEffect } from "react";
import "./Felines.css";
import catNames from "./catNames";

function Felines() {

  const [felines, setFelines] = useState([]);
  const [catInfo, setCatInfo] = useState(null);
  const [loading, setLoading] = useState(false);
  const [banList, setBanList] = useState([]);
  const [catName, setCatName] = useState("");

  const addToBanList = (property, value) => {
    const newBanItem = { property, value };
    if (
      !banList.some(
        (item) => item.property === property && item.value === value,
      )
    ) {
      setBanList((prev) => [...prev, newBanItem]);
    }
  };

  const removeFromBanList = (index) => {
    setBanList((prev) => prev.filter((_, i) => i !== index));
  };

  const isCatBanned = (catData) => {
    if (!catData.breeds || !catData.breeds[0]) return false;

    const breed = catData.breeds[0];
    return banList.some((banItem) => {
      switch (banItem.property) {
        case "breed":
          return breed.name === banItem.value;
        case "weight":
          return breed.weight?.imperial === banItem.value;
        case "origin":
          return breed.origin === banItem.value;
        case "life_span":
          return breed.life_span === banItem.value;
        default:
          return false;
      }
    });
  };

  const fetchFelines = async () => {
    setLoading(true);
    try {
      let validCat = null;
      let attempts = 0;
      const maxAttempts = 100;

      while (!validCat && attempts < maxAttempts) {
        const response = await fetch(
          "https://api.thecatapi.com/v1/images/search?has_breeds=1&api_key=" +
            ACCESS_KEY,
        );
        const data = await response.json();
        const catID = data[0].id;

        const actualData = await fetch(
          "https://api.thecatapi.com/v1/images/" + catID,
        );
        const actualDataJson = await actualData.json();

        if (!isCatBanned(actualDataJson)) {
          validCat = actualDataJson;
        }
        attempts++;
      }

      if (validCat) {
        setFelines(validCat.url);
        setCatInfo(validCat);
        setCatName(catNames[Math.floor(Math.random() * catNames.length)]);
        console.log(validCat);
      } else {
        console.log(
          "Could not find a cat that meets ban list criteria after",
          maxAttempts,
          "attempts",
        );
      }
    } catch (error) {
      console.error("Error fetching cat:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFelines();
  }, []);

  return (
    <div>
      <h1 className="app-title">FelineFinder</h1>
      <div className="app-container">
        <div className="main-content">
          <h1>
            {" "}
            Meet{" "}
            {catName ||
              catNames[Math.floor(Math.random() * catNames.length)]}{" "}
            :3
          </h1>

          {felines && (
            <img src={felines} alt="Random cat" className="cat-image" />
          )}

          <button onClick={fetchFelines} disabled={loading}>
            {loading ? "Loading..." : "Get Random Cat"}
          </button>

          {catInfo && catInfo.breeds && catInfo.breeds[0] && (
            <div className="cat-info-grid">
              <div
                className="info-box clickable"
                onClick={() => addToBanList("breed", catInfo.breeds[0].name)}
              >
                <h3>Breed</h3>
                <p>{catInfo.breeds[0].name}</p>
              </div>
              <div
                className="info-box clickable"
                onClick={() =>
                  addToBanList(
                    "weight",
                    catInfo.breeds[0].weight?.imperial || "N/A",
                  )
                }
              >
                <h3>Weight</h3>
                <p>{catInfo.breeds[0].weight?.imperial || "N/A"} lbs</p>
              </div>
              <div
                className="info-box clickable"
                onClick={() => addToBanList("origin", catInfo.breeds[0].origin)}
              >
                <h3>Origin</h3>
                <p>{catInfo.breeds[0].origin}</p>
              </div>
              <div
                className="info-box clickable"
                onClick={() =>
                  addToBanList("life_span", catInfo.breeds[0].life_span)
                }
              >
                <h3>Life Span</h3>
                <p>{catInfo.breeds[0].life_span} years</p>
              </div>
            </div>
          )}
        </div>

        <div className="side-panel">
          <h2 className="side-panel-title">Ban List</h2>
          {banList.length === 0 ? (
            <p className="empty-ban-list">
              Click on any property above to ban it
            </p>
          ) : (
            <p className="ban-instruction">
              Click on any banned property below to remove it from the ban list
            </p>
          )}
          {banList.length > 0 && (
            <div className="ban-list">
              {banList.map((item, index) => (
                <div
                  key={index}
                  className="ban-item clickable"
                  onClick={() => removeFromBanList(index)}
                >
                  <div className="ban-content">
                    <strong>{item.property}:</strong> {item.value}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Felines;
