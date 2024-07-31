// import { useState, useEffect } from 'react';

// export const useGoogleMaps = () => {
//   const [isLoaded, setIsLoaded] = useState(false);

//   useEffect(() => {
//     if (window.google && window.google.maps) {
//       setIsLoaded(true);
//     } else {
//       const checkGoogleInterval = setInterval(() => {
//         if (window.google && window.google.maps) {
//           setIsLoaded(true);
//           clearInterval(checkGoogleInterval);
//         }
//       }, 100);

//       return () => clearInterval(checkGoogleInterval);
//     }
//   }, []);

//   return isLoaded;
// };