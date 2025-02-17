figma.showUI(__html__);

figma.ui.onmessage = async (msg: { type: string; count: number }) => {
  if (msg.type === "export") {
    const localCollections = await figma.variables.getLocalVariablesAsync();
    const resultObj: { [key: string]: string | number } = {};
    for (const variable of localCollections) {
      const data = await figma.variables.getVariableByIdAsync(variable.id);
      const variableType = data?.resolvedType;
      const variableKey = data?.name;
      //[::TODO] "1:0"은 대체 어디서 뽑을 수 있는건지..?
      const variableValue = data?.valuesByMode["1:0"];
      if (variableKey) {
        // extract COLOR variables
        if (variableType === "COLOR") {
          const { r, g, b } = variableValue as {
            r: number;
            g: number;
            b: number;
            // a: number;
          };
          // convert rgb to hex
          // alpha 값은 굳이 계산 안해도 될 것 같음.(Figma의 hex 값이 rgb까지 변환된 값)
          const hex = [r, g, b]
            .map((color) => Math.floor(color * 255))
            .reduce((acc, cur) => acc + cur.toString(16), "#");
          resultObj[variableKey] = hex;
        }
      }
    }

    const saveRequest = await fetch(
      "http://localhost:8088/api/figma/save-variables",
      {
        method: "POST",
        body: JSON.stringify(resultObj),
        headers: {
          "Content-Type": "application/json",
          "hw-rui-token": "hw-rui-server-test",
        },
      }
    );

    if (saveRequest.ok) {
      const response = await saveRequest.json();
      console.log(response);
    }
    /**
     {
       "color/cobalt/100": "#d5dbfa",
       "color/cobalt/200": "#abb6f5",
       "color/cobalt/300": "#8293f2",
       "color/cobalt/400": "#586eed",
       "color/cobalt/500": "#4253b2",
       "color/cobalt/600": "#2c3776"
     }
     */
  }
};
