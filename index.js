(async () => {
  let buildMode = "none";
  let consoleText = ["正在启动"];
  let errorText = "";
  let fillData = {
    p1: null,
    p2: null,
    preview: null,
    voxel: null,
    backUp: [],
  };
  Object.defineProperties(global, {
    fill: {
      get: () => {
        buildMode = "fill";
      },
    },

    fp1: {
      set: (val) => {
        if (val && typeof val == "string") {
          errorText = "";
          let inp = val.split(" ");
          if (inp.length != 3) {
            errorText = "fp1应该是一个位置字符串,一共3个数字,中间用空格隔开";
          } else if (isNaN(inp[0]) || isNaN(inp[1]) || isNaN(inp[2])) {
            errorText = "fp1中的3段数据必须都是正确的数字";
          } else {
            fillData.p1 = new Box3Vector3(
              Number(inp[0]),
              Number(inp[1]),
              Number(inp[2])
            );
          }
        } else {
          errorText = '请将fp1设置为XYZ位置字符串\n示例: fp1="64 15 63"';
        }
      },
    },
    fp2: {
      set: (val) => {
        if (val && typeof val == "string") {
          errorText = "";
          let inp = val.split(" ");
          if (inp.length != 3) {
            errorText = "fp2该是一个位置字符串,一共3个数字,中间用空格隔开";
          } else if (isNaN(inp[0]) || isNaN(inp[1]) || isNaN(inp[2])) {
            errorText = "fp2中的3段数据必须都是正确的数字";
          } else {
            fillData.p2 = new Box3Vector3(
              Number(inp[0]),
              Number(inp[1]),
              Number(inp[2])
            );
          }
        } else {
          errorText = '请将fp2设置为XYZ位置字符串\n示例: fp2="64 15 63"';
        }
      },
    },
    fv: {
      set: (val) => {
        errorText = "";
        if (val && typeof val == "string") {
          fillData.voxel = voxels.id(val);
        } else if (typeof val == "number") {
          fillData.voxel = val;
        } else {
          errorText =
            "请将fv设置为 方块数字ID 或者 方块英文名\n示例: fv = 'dirt'";
        }
      },
    },
    fno: {
      get: () => {
        errorText = "";
        if (!fillData.preview) {
          errorText = "你还没有预览填充,无法进行这个操作";
        } else {
          fillData.preview = false;
          let minX = Math.min(fillData.p2.x, fillData.p1.x);
          let maxX = Math.max(fillData.p2.x, fillData.p1.x);
          let minY = Math.min(fillData.p2.y, fillData.p1.y);
          let maxY = Math.max(fillData.p2.y, fillData.p1.y);
          let minZ = Math.min(fillData.p2.z, fillData.p1.z);
          let maxZ = Math.max(fillData.p2.z, fillData.p1.z);
          for (let x = minX; x <= maxX; x++) {
            for (let y = minY; y <= maxY; y++) {
              for (let z = minZ; z <= maxZ; z++) {
                voxels.setVoxel(x, y, z, fillData.backUp[0]);
                fillData.backUp.slice(0);
              }
            }
          }
        }
      },
    },
    fdone: {
      get: () => {
        errorText = "";
        if (!fillData.p1 || !fillData.p2 || !fillData.voxel) {
          errorText = "填充信息不完整";
        }
        if (!fillData.preview) {
          fillData.backUp = [];
          fillData.preview = true;
          let minX = Math.min(fillData.p2.x, fillData.p1.x);
          let maxX = Math.max(fillData.p2.x, fillData.p1.x);
          let minY = Math.min(fillData.p2.y, fillData.p1.y);
          let maxY = Math.max(fillData.p2.y, fillData.p1.y);
          let minZ = Math.min(fillData.p2.z, fillData.p1.z);
          let maxZ = Math.max(fillData.p2.z, fillData.p1.z);
          for (let x = minX; x <= maxX; x++) {
            for (let y = minY; y <= maxY; y++) {
              for (let z = minZ; z <= maxZ; z++) {
                fillData.backUp.push(voxels.getVoxel(x, y, z));
                voxels.setVoxel(x, y, z, fillData.voxel);
              }
            }
          }
        } else {
          fillData.p1 = fillData.p2 = fillData.p3 = fillData.voxel = null;
          fillData.preview = false;
          buildMode = "none";
        }
      },
    },
  });
  world.onTick(() => {
    consoleText = ["---------"];
    if (buildMode == "fill") {
      consoleText.push("填充模式:");
      consoleText.push(
        fillData.p1
          ? `  对角点1: <${fillData.p1.x},${fillData.p1.y},${fillData.p1.z}>`
          : "  对角点1: <未选择>"
      );
      consoleText.push(
        fillData.p2
          ? `  对角点2: <${fillData.p2.x},${fillData.p2.y},${fillData.p2.z}>`
          : "  对角点2: <未选择>"
      );
      consoleText.push(
        fillData.voxel
          ? `  填充方块: ${voxels.name(fillData.voxel)} (${fillData.voxel})`
          : `  填充方块: <未选择>`
      );
      if (!fillData.p1 || !fillData.p2 || !fillData.voxel) {
        consoleText.push(
          "提示:\n  通过设置变量fp1 和 fp2 来设置对角点\n  通过设置变量fv 来指定填充使用的方块"
        );
      }
      if (fillData.p1 && fillData.p2 && fillData.voxel && !fillData.preview) {
        consoleText.push("提示:\n  输入fdone进行填充预览");
      }
      if (fillData.preview) {
        consoleText.push("提示:\n 再次输入fdone确认填充\n输入fno撤销操作");
      }
    } else {
      consoleText.push("未选择模式,\n输入fill选择填充模式");
    }
    consoleText.push("---------");
    let finalText = consoleText.join("\n");
    console.clear();
    console.log(finalText);
    console.error(errorText);
  });
})();
