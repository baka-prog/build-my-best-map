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
    fp2: { //? 和fp1大同小异
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
    fdone: { // 用于确认的变量
      get: () => { // 设置getter
        errorText = ""; //* 重置错误信息
        if (!fillData.p1 || !fillData.p2 || !fillData.voxel) { // 如果填充信息不足
          errorText = "填充信息不完整"; //* 提示错误
        }
        else if (!fillData.preview) { // 如果不是预览模式
          fillData.backUp = []; //* 重置备份数组
          fillData.preview = true; //* 开始预览

          //* 计算最高点和最低点的XYZ坐标
          let minX = Math.min(fillData.p2.x, fillData.p1.x);
          let maxX = Math.max(fillData.p2.x, fillData.p1.x);
          let minY = Math.min(fillData.p2.y, fillData.p1.y);
          let maxY = Math.max(fillData.p2.y, fillData.p1.y);
          let minZ = Math.min(fillData.p2.z, fillData.p1.z);
          let maxZ = Math.max(fillData.p2.z, fillData.p1.z);

          //* 使用for循环填充
          for (let x = minX; x <= maxX; x++) {
            for (let y = minY; y <= maxY; y++) {
              for (let z = minZ; z <= maxZ; z++) {
                fillData.backUp.push(voxels.getVoxel(x, y, z)); //* 按照顺序将方块ID放入备份数组
                voxels.setVoxel(x, y, z, fillData.voxel); //* 设置方块
              }
            }
          }
        } else { // 否则,也就是确认填充
          fillData.p1 = fillData.p2 = fillData.p3 = fillData.voxel = null; //* 重置填充数据
          fillData.preview = false; //* 重置预览状态
          buildMode = "none"; //* 重置功能模式
        }
      },
    },
  });
  world.onTick(() => { // Tick事件,用于控制台提示信息
    //? 由于Box3是每Tick给用户同步一次数据,所以写进Tick中可以减少文字的闪烁
    consoleText = ["---------"]; //* 重置信息数组
    if (buildMode == "fill") { // 如果是填充模式
      consoleText.push("填充模式:"); //* 添加一行提示
      consoleText.push(
        fillData.p1
          ? `  对角点1: <${fillData.p1.x},${fillData.p1.y},${fillData.p1.z}>`
          : "  对角点1: <未选择>"
      ); //* 添加一行对角点提示
      consoleText.push(
        fillData.p2
          ? `  对角点2: <${fillData.p2.x},${fillData.p2.y},${fillData.p2.z}>`
          : "  对角点2: <未选择>"
      ); //* 添加一行对角点提示
      consoleText.push(
        fillData.voxel
          ? `  填充方块: ${voxels.name(fillData.voxel)} (${fillData.voxel})`
          : `  填充方块: <未选择>`
      ); //* 添加一行填充方块提示
      if (!fillData.p1 || !fillData.p2 || !fillData.voxel) { // 如果信息没有填完
        consoleText.push(
          "提示:\n  通过设置变量fp1 和 fp2 来设置对角点\n  通过设置变量fv 来指定填充使用的方块"
        );
      } //* 添加一行操作提示
      if (fillData.p1 && fillData.p2 && fillData.voxel && !fillData.preview) { // 如果填完了信息,并且没有预览
        consoleText.push("提示:\n  输入fdone进行填充预览"); //* 添加一行操作提示
      }
      if (fillData.preview) { // 如果正在预览
        consoleText.push("提示:\n 再次输入fdone确认填充\n输入fno撤销操作"); //* 添加一行操作提示
      }
    } else { //否则,也就是没有选择功能模式
      consoleText.push("未选择模式,\n输入fill选择填充模式"); //* 添加一行操作提示
    }
    consoleText.push("---------"); //* 添加最后的分割线
    let finalText = consoleText.join("\n"); //* 将文本数组合并
    console.clear(); //* 先清空控制台
    console.log(finalText); //* 立即写入文本
    console.error(errorText); //* 用红色文本显示错误信息
  });
})();
