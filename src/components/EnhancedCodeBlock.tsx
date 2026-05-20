import { React } from "@vendetta/metro/common";
import { findByProps } from "@vendetta/metro";
import { tokenize, gc, LABEL, Colors } from "../utils/tokenizer";

const RN = (globalThis as any).bunny?.metro?.common?.ReactNative ?? findByProps("View","Text","ScrollView");
const { View, Text, TouchableOpacity, ScrollView, StyleSheet } = RN;
const Clip = findByProps("setString","getString") ?? { setString: (_:string)=>{} };

const S = StyleSheet.create({
  wrap:{marginVertical:4,borderRadius:8,borderWidth:1,borderColor:Colors.border,overflow:"hidden",backgroundColor:Colors.bg},
  top:{flexDirection:"row",alignItems:"center",justifyContent:"space-between",backgroundColor:Colors.bgSurf,paddingHorizontal:12,paddingVertical:6,borderBottomWidth:1,borderBottomColor:Colors.border},
  dot:{width:8,height:8,borderRadius:4,backgroundColor:Colors.accent},
  langTxt:{color:Colors.muted,fontSize:11,fontFamily:"monospace",marginLeft:6,letterSpacing:.5},
  scroll:{maxHeight:300},
  inner:{flexDirection:"row",padding:12},
  nums:{paddingRight:10,marginRight:10,borderRightWidth:1,borderRightColor:Colors.border,alignItems:"flex-end",minWidth:28},
  num:{color:Colors.muted,fontFamily:"monospace",fontSize:12,lineHeight:20,textAlign:"right"},
  code:{fontFamily:"monospace",fontSize:13,lineHeight:20,color:Colors.text},
  bar:{flexDirection:"row",alignItems:"center",backgroundColor:Colors.bgSurf,borderTopWidth:1,borderTopColor:Colors.border,paddingHorizontal:8,paddingVertical:4,gap:6},
  barInfo:{flex:1,color:Colors.muted,fontSize:10,fontFamily:"monospace"},
  btn:{paddingHorizontal:10,paddingVertical:5,borderRadius:5,borderWidth:1,borderColor:Colors.border,backgroundColor:Colors.bgOver},
  btnOk:{borderColor:Colors.success,backgroundColor:"#1e3a2a"},
  btnTxt:{color:Colors.text,fontSize:11,fontFamily:"monospace"},
  btnTxtOk:{color:Colors.success},
});

export function EnhancedCodeBlock({content,language,storage}:{content:string;language?:string;storage:any}){
  const [copied,setCopied]=React.useState(false);
  const [expanded,setExpanded]=React.useState(false);
  const lang=(language||"").toLowerCase();
  const label=LABEL[lang]??(lang?lang.toUpperCase():"Code");
  const lines=content.split("\n");
  const tokens=tokenize(content,lang);

  const doCopy=()=>{
    Clip.setString(content);
    setCopied(true);
    setTimeout(()=>setCopied(false),2000);
  };

  return React.createElement(View,{style:S.wrap},
    // Top bar
    React.createElement(View,{style:S.top},
      React.createElement(View,{style:{flexDirection:"row",alignItems:"center"}},
        React.createElement(View,{style:S.dot}),
        React.createElement(Text,{style:S.langTxt},label)
      ),
    ),
    // Code
    React.createElement(ScrollView,{horizontal:true,showsHorizontalScrollIndicator:false,style:expanded?null:S.scroll},
      React.createElement(ScrollView,{showsVerticalScrollIndicator:true,nestedScrollEnabled:true},
        React.createElement(View,{style:S.inner},
          storage?.lineNumbers!==false&&React.createElement(View,{style:S.nums},
            ...lines.map((_:any,i:number)=>React.createElement(Text,{key:i,style:S.num},String(i+1)))
          ),
          React.createElement(Text,{selectable:true,style:S.code},
            ...tokens.map((tok:any,i:number)=>
              React.createElement(Text,{key:i,style:{color:gc(tok.t),fontFamily:"monospace"}},tok.v)
            )
          )
        )
      )
    ),
    // Bottom nav bar
    React.createElement(View,{style:S.bar},
      React.createElement(Text,{style:S.barInfo},`${lines.length} lines · ${new TextEncoder().encode(content).length}B`),
      React.createElement(TouchableOpacity,{style:S.btn,onPress:()=>setExpanded(e=>!e),activeOpacity:.7},
        React.createElement(Text,{style:S.btnTxt},expanded?"▲":"▼")
      ),
      React.createElement(TouchableOpacity,{style:[S.btn,copied&&S.btnOk],onPress:doCopy,activeOpacity:.7},
        React.createElement(Text,{style:[S.btnTxt,copied&&S.btnTxtOk]},copied?"✓ Copied":"⎘ Copy")
      )
    )
  );
}
