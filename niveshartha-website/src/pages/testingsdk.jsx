import React from "react";

export default function DigioButton() {
  
    // Digio is loaded from script tag
    

    var options = {
  environment: "sandbox",
  callback: function(response) {
    if (response.hasOwnProperty("error_code")){
      return console.log("error occurred in process");
    }
    console.log("Signing;completed;successfully:");
  },
  logo: "https://www.mylogourl.com/image.jpeg",
  theme: {
    primaryColor: "#AB3498",
    secondaryColor: "#000000"
  }
};
var digio = new Digio(options);

digio.init();

  return (
    <button
      onClick={DigioButton}
      className="px-4 py-2 bg-blue-600 text-white rounded-lg"
    >
      Start KYC
    </button>
  );
}

