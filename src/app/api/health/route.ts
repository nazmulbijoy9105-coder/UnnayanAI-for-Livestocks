export async function POST(request){const{t}=await request.json();return Response.json({alert:t>39.5,bangla:t>39.5?"গরুর জ্বর!":"OK",risk:t>39.5?"high":"low"});}
