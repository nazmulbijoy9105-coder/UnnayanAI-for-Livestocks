export async function POST(req){const{t}=await req.json();return Response.json({alert:t>39.5,bangla:t>39.5?'গরুর জ্বর!':'স্বাভাবিক'});}
