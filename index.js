//? 使用异步匿名函数，封装代码，防止作用域污染
(async () => {
  let buildMode = "none"; //* 初始化建筑模式
  let consoleText = ["正在启动"]; //* 初始化控制台提示文本数组
  let errorText = ""; //* 初始化错误信息
  let fillData = { //* 初始化填充数据
    p1: null, // 对角点1
    p2: null, // 对角点2
    preview: null, // 预览模式标志
    voxel: null, // 填充方块
    backUp: [], // 用于撤销的数组
  };
  Object.defineProperties(global, { //* 给全局添加属性（变量）
    fill: { // 用于选择填充模式的变量
      get: () => { //? 添加getter方法，这样一来只用输入变量名（获取）就可以执行这个方法
        buildMode = "fill"; //* 设置填充模式
      },
    },

    fp1: { // 用于设置对角点1的变量
      set: (val) => { //? 设置一个setter方法，这样一来只用设置这个变量就可以执行这个方法，设置的内容就是val
        if (val && typeof val == "string") { // 检测传入的数据是否存在，以及是否是字符串类型
          errorText = ""; //* 重置错误信息
          let inp = val.split(" "); //* 用空格分割传入数据
          if (inp.length != 3) { // 如果分割得到的数组长度不是3
            errorText = "fp1应该是一个位置字符串,一共3个数字,中间用空格隔开"; //* 提示错误信息
          } else if (isNaN(inp[0]) || isNaN(inp[1]) || isNaN(inp[2])) { // 否则，如果三个数中有一个错误（无法转换数字）
            errorText = "fp1中的3段数据必须都是正确的数字"; //* 提示错误信息
          } else {
            fillData.p1 = new Box3Vector3(
              Number(inp[0]),
              Number(inp[1]),
              Number(inp[2])
            ); //* 设置对角点1的信息
          }
        } else { // 否则
          errorText = '请将fp1设置为XYZ位置字符串\n示例: fp1="64 15 63"'; //* 提示出错误
        }
      },
    },
    fp2: { //! 和fp1大同小异
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
    fv: { // 用于设置填充方块的变量
      set: (val) => { // 设置setter
        errorText = ""; //* 重置错误信息
        if (val && typeof val == "string") { // 如果是字符串类型
          fillData.voxel = voxels.id(val); // 通过字符串转换为方块ID
        } else if (typeof val == "number") {// 如果是数字类型
          fillData.voxel = val; // 直接设置为方块ID
        } else { //否则
          errorText =
            "请将fv设置为 方块数字ID 或者 方块英文名\n示例: fv = 'dirt'"; //* 提示错误信息
        }
      },
    },
    fno: { // 用于撤销的变量
      get: () => { //设置getter
        errorText = ""; //* 重置错误信息
        if (!fillData.preview) { //如果没有预览
          errorText = "你还没有预览填充,无法进行这个操作"; //* 提示错误信息
        } else { // 否则
          fillData.preview = false; //* 重置预览状态

          //* 获取到最大最小的两点XYZ坐标，得到最高最低点
          let minX = Math.min(fillData.p2.x, fillData.p1.x);
          let maxX = Math.max(fillData.p2.x, fillData.p1.x);
          let minY = Math.min(fillData.p2.y, fillData.p1.y);
          let maxY = Math.max(fillData.p2.y, fillData.p1.y);
          let minZ = Math.min(fillData.p2.z, fillData.p1.z);
          let maxZ = Math.max(fillData.p2.z, fillData.p1.z);

          //? 由于建造和备份的for循环顺序一致，所以再次循环即可还原
          //* 使用for循环还原方块
          for (let x = minX; x <= maxX; x++) {
            for (let y = minY; y <= maxY; y++) {
              for (let z = minZ; z <= maxZ; z++) {
                voxels.setVoxel(x, y, z, fillData.backUp[0]); //* 设置为撤销的第一项，也就是当前位置的备份方块
                fillData.backUp.slice(0);//* 删除第一项，为下一次循环准备
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
          fillData.backUp = []; //* 重置备份数组
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
