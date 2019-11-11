
 //处理源代码的函数，返回的数组用于之后 匹配分离单行信息中的错误信息和代码
    function getCode_Array( code ){
        var codeArr = code.split('\n');
        //将下标推后一位
        codeArr.unshift('#');
        return codeArr;
    }
    

    //将函数名放入返回的Json数组中
    function pushFunctnNameInto_JsonArray( jsonArray, functnMessage ){
        var functionStart = "In function";
            jsonArray.push( { key : "normalData", value : functionStart } );

        // 保存当前函数名
        var functionName = functnMessage.replace(functionStart + ' ', "");
        functionName = functionName.replace( ": ", "");
            jsonArray.push( { key : "functionName", value : functionName } );
            jsonArray.push( { key : "lineFeed", value : "\n" } );
    }

    //删除源代码中不必要的空格，便于匹配出错信息的代码
    function deleteUnnecessarySpace( code ){
        code = code.trim();
        var i;
        var formatedCode = "";
        var flag = 0;
        for( i = 0; i < code.length; i++)
        {
            if( code[i] != ' ')
            {
                formatedCode += code[i];
                flag = 0;
            }
            else if( code[i] == ' ' && flag == 0)
                {
                    formatedCode += code[i];
                    flag = 1;
                }    
        }
        return formatedCode;
    }

    function showSpace( code ){
        var i;
        var showed = "";
        for( i = 0; i < code.length; i++ )
        {
            if( code[i] == ' ')
                showed += '*';
            else showed += code[i];
        }
        return showed;
    }

    //将单行出错信息的各部分分离的函数
    function MessageAndCode_Split( normalLine, codeArr ){
        var backArr = [];

        //var str = "7:13: error: overloaded function with no contextual type information min = b;"
        //得到行号
        var lineNum_row = normalLine.slice( 0, normalLine.indexOf(':') );
        //临时删除行号
        normalLine = normalLine.slice( normalLine.indexOf(':') + 1);    //+1 为了删除冒号

        //得到列号
        var lineNum_col = normalLine.slice( 0, normalLine.indexOf(':') );
        //临时删除列号
        normalLine = normalLine.slice( normalLine.indexOf(':') + 2);

        backArr.push( lineNum_row + ':' + lineNum_col );

        //剩余信息为 出错类型+出错信息+代码
        
            //得到出错类型
            var errorTypeName = normalLine.slice( 0, normalLine.indexOf(':') );
            //临时删除出错类型
            normalLine = normalLine.slice( normalLine.indexOf(':') + 2);
            backArr.push( errorTypeName );

            //分离出错信息和代码
            //得到代码，与源代码同一行匹配
            var row = parseInt( lineNum_row );
                //源代码数组 元素保留了每行源代码中的空格！！！！
                //使用数组方法trim，去除代码两边的空格
                //考虑到源代码中带有注释的问题，需要把空格都消成一个？？？

            var formatedCode = deleteUnnecessarySpace( codeArr[row] );
            var codeIndex = normalLine.lastIndexOf( formatedCode );
            var code = normalLine.slice( codeIndex );
            //临时删除代码部分
            normalLine = normalLine.slice( 0, codeIndex-1);


            //得到出错信息
            //剩余部分即为出错信息
            var errorMsg = normalLine;

            backArr.push( errorMsg );
            backArr.push( codeArr[row] );
            

            return backArr;
    }
    
    
    //将分离的各部分信息放入返回的Json数组中
    function pushErrorMsgInto_JsonArray( jsonArray, backArr){
            jsonArray.push( { key : "lineNum", value : backArr[0] } );
            jsonArray.push( { key : "errorTypeName", value : backArr[1] } );
            jsonArray.push( { key : "errorMsg", value : backArr[2] } );
            jsonArray.push( { key : "lineFeed", value : '\n' } );
            jsonArray.push( { key : "code", value : backArr[3] } );
            jsonArray.push( { key : "lineFeed", value : '\n' } );
            jsonArray.push( { key : "lineFeed", value : '\n' } );
    }
    //得到日期的函数
    function getFormDate(){
        var d = new Date();
        var year = d.getFullYear();
        var month = d.getMonth() + 1;
        var day = d.getDate();
        var hour = d.getHours();
        var min = d.getMinutes();
        var sec = d.getSeconds();
        return year + '-'+ month + '-' + day + ' ' + hour + ':' + min + ':' + sec;
    }
    
    //格式化编译信息函数
    export function formatCompileData( compileData, code ){
      //将源代码按行分离，得到一个储存各行代码的数组，数组的下标即为该行代码的行号
      var codeArr = getCode_Array( code);
      //返回的json数组
      var jsonArray = [];
  //第一部分，提取文件名
          //第一行信息，找到文件名，之后以文件名为分隔符，分割字符串
          //文件名在第一个回车符，跳过一个冒号，到倒数第一个空格之间
          //假如fileNameIndexEnd一开始就是负数，则将会陷入死循环
      var fileNameIndexEnd = compileData.lastIndexOf( ':', compileData.indexOf('\n'));  
      var fileNameIndexStart = fileNameIndexEnd;
      while( compileData.charAt(fileNameIndexStart-1) != ' '){
        console.log(fileNameIndexStart,compileData.indexOf('\n'))
        fileNameIndexStart--;
      }
      var fileName = compileData.slice( fileNameIndexStart, fileNameIndexEnd );
          //文件名存入json数组
          jsonArray.push( {key : "fileName", value : fileName} );
          jsonArray.push( {key : "lineFeed", value : "\n"} );
          //删除第一行(临时)
      var firstLine = compileData.slice( 0, compileData.indexOf('\n') );//不包含回车符
      compileData = compileData.replace( firstLine, "");
      //清除数据的回车符
      compileData = compileData.replace(/\n/g, '');
  //第二部分
      //先清除^符号
      //以文件名为分隔符，分割字符串，结果：得到一个存储各行信息的数组
      compileData = compileData.replace(/ \^ /g, '');
      compileData = compileData.replace(/ \^/g, '');
      var dataArray = compileData.split( fileName + ':' );

      //遍历得到的数组，对函数名和该函数下的出错信息进行不同处理
      var i;     
      for( i = 0; i < dataArray.length; i++)
      {
          if( dataArray[i] == "")
              continue;
          //遇到函数名则收集函数名
          if( dataArray[i].indexOf("In function") != -1 )
              pushFunctnNameInto_JsonArray( jsonArray, dataArray[i] );
          else {
              //对单行错误信息的处理
                  //backArr格式 = [行号列号，出错类型，出错详细信息，代码]
              var backArr = MessageAndCode_Split( dataArray[i], codeArr );
              //存入json数组
              pushErrorMsgInto_JsonArray( jsonArray, backArr );
          }
      }
      console.log(jsonArray);
      return jsonArray;
  }