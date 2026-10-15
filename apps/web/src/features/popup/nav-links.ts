/** Deep links that open the navigation app directly (or its website if not installed). */
export function wazeUrl(lat: number, lng: number) {
  return `https://waze.com/ul?ll=${lat},${lng}&navigate=yes`;
}
export function googleMapsUrl(lat: number, lng: number) {
  return `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;
}
export function appleMapsUrl(lat: number, lng: number) {
  return `https://maps.apple.com/?daddr=${lat},${lng}`;
}
