int l =  1;
int metadataCounter = 0;
JSONObject json;
JSONArray jsonArray; 
JSONArray metadata = new JSONArray();
String[] colors = { "Red", "Blue", "Green" };
int[] counters = { 0, 0, 0};
void setup() {
  size(800,800);
  background(0);
  if(l < 101){
    counters[0] = 0;
    counters[1] = 0;
    counters[2] = 0;
    init();
  }
  else{
    printMetadata();
  }
}



void init() {
  println (random(10));
  int i = 0;
  while (i <9){
    i = i+1;
    println(i);
    int j = 1;
    while (j < 9) {
      print(j + " ");
      int posX = i * 90;
      int posY = j * 90;
      j = j+1;
      float squareSize = 20;
      int randomNumber = int(random(3));
      if(randomNumber == 0){
        fill(255,0,0);
        rect(posX, posY, squareSize, squareSize);
        counters[0]++;
      }
      if(randomNumber == 1){
        fill(0,255,0);
        rect(posX, posY, squareSize, squareSize);
        counters[1]++;
      }
      if(randomNumber == 2){
        fill(0,0,255);
        rect(posX, posY, squareSize, squareSize);
        counters[2]++;
      }
    }
  }
  println("we are done");
  save("test" + l + ".png");
      json = new JSONObject();
      jsonArray = new JSONArray();
      JSONArray values = new JSONArray();
  
    json.setInt("id", l);
    json.setString("name", "Squares");
    json.setString("description", "aaaaa");
    json.setString("image", "ipfs://NFTURI");

  for (int f = 0; f < 3; f++) {
    JSONObject attributes = new JSONObject();
    attributes.setString("trait_type", colors[f]);
    attributes.setInt("value",counters[f] );
    values.setJSONObject(f, attributes);
  }
  
  json.setJSONArray("attributes",values);
  metadata.setJSONObject(metadataCounter,json);
  metadataCounter++;
    
  saveJSONObject(json, "data/new" + l + ".json");
  l = l + 1;
  setup();
}



void printMetadata(){
  saveJSONArray(metadata, "data/_metadata.json");
}
