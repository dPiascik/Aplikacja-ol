export interface PositionData {
    latitude: number,
    longitude: number,
    isInsidePolygon: boolean,
    exitTime: Date
}

export const SendDataToServer = async (body: PositionData) => {
    fetch('https://localhost:7152/api/positiondata', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      })
        .then((response) => response.json())
        .then((data) => {
          console.log(data);
        })
        .catch((error) => {
          console.error('Błąd podczas wywoływania endpointu API:', error);
        });
  };
