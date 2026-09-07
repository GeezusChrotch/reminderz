const {test}=require('node:test'),fs=require('node:fs'),path=require('node:path'),os=require('node:os'),{execFileSync}=require('node:child_process');
function check(source,setup,main){const dir=fs.mkdtempSync(path.join(os.tmpdir(),'organik-buttons-'));try{fs.writeFileSync(path.join(dir,'test.c'),'#include <stdbool.h>\n#include <stdint.h>\n#include <stddef.h>\n#include <string.h>\n#include <assert.h>\n'+setup+'\n'+source+'\nint main(void){'+main+'}');execFileSync('cc',[path.join(dir,'test.c'),'-o',path.join(dir,'test')]);execFileSync(path.join(dir,'test'));}finally{fs.rmSync(dir,{recursive:true,force:true});}}

test('Double Back executes the seventh packed action for the active screen',()=>{
 const src=fs.readFileSync(path.join(__dirname,'../src/c/main.c'),'utf8');
 const body=src.slice(src.indexOf('static void double_back('),src.indexOf('static void button_config('));
 check(body,`typedef int ClickRecognizerRef;typedef void MenuLayer;static void*s_lists_menu=(void*)1,*s_reminders_menu=(void*)2;static uint32_t s_buttons_lists,s_buttons_reminders;static int last;static void*screen;static void button_action(MenuLayer*m,uint8_t a){screen=m;last=a;}`,
 `double_back(0,s_lists_menu);assert(last==0);s_buttons_lists=5<<18;s_buttons_reminders=(6<<18)|7;double_back(0,s_lists_menu);assert(last==5&&screen==s_lists_menu);double_back(0,s_reminders_menu);assert(last==6&&screen==s_reminders_menu);`);
});
