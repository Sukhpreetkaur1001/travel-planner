// import { useEffect, useState } from "react";
// import { useParams } from "react-router-dom";
// import api from "../../utils/api";

// const TransportPage = () => {
//   const { id } = useParams();

//   const [trip, setTrip] = useState(null);

//   useEffect(() => {
//     fetchTrip();
//   }, []);

//   const fetchTrip = async () => {
//     try {
//       const response = await api.get(`/trips/${id}`);
//       setTrip(response.data);
//     } catch (error) {
//       console.log(error);
//     }
//   };

//   if (!trip) return <h2>Loading...</h2>;

//   return (
//     <div className="container">
//       <h1>Transport Options</h1>
//     </div>
//   );
// };

// export default TransportPage;