import{b as L,c as O,d as R}from"https://martamonteagudo.com/app.framerstatic.com/chunk-44F2XYET.mjs";import{a as e}from"https://martamonteagudo.com/app.framerstatic.com/chunk-C2F4XP2J.mjs";import{a as T}from"https://martamonteagudo.com/app.framerstatic.com/chunk-JMJL2ZVN.mjs";import{a}from"https://martamonteagudo.com/app.framerstatic.com/chunk-XNIFBQQE.mjs";import{a as o,b as r,c}from"https://martamonteagudo.com/app.framerstatic.com/chunk-DQO6NDTL.mjs";import{a as S,b as F,c as f}from"https://martamonteagudo.com/app.framerstatic.com/chunk-ISW56VHA.mjs";import{a as M}from"https://martamonteagudo.com/app.framerstatic.com/chunk-QFU6OGL3.mjs";import{a as H}from"https://martamonteagudo.com/app.framerstatic.com/chunk-2FCXHKEL.mjs";import{a as cr}from"https://martamonteagudo.com/app.framerstatic.com/chunk-SWYZG2NI.mjs";import{b as A}from"https://martamonteagudo.com/app.framerstatic.com/chunk-4JY5UMT2.mjs";import{e as C}from"https://martamonteagudo.com/app.framerstatic.com/chunk-WLHSDIGQ.mjs";var p=C(cr());var t="shadow";var fr=l=>l==="light"?c:e,ar=l=>Object.entries(l).map(([n,s])=>`${n}: ${s};`).join(`
`);function m(l,n,s={}){let u=fr(l),B={};return Object.entries(u).forEach(([g,b])=>{if(g in s){let i=s[g];if(!i)return;B[S(g,a)]=i;return}if(b in n){let i=n[b];if(!i)return;B[S(g,a)]=i}}),ar(B)}var V={[c.tint]:c.componentTint,[c.tintDark]:r.purple140,[c.tintDimmed]:c.componentTintDimmed,[r.blue75]:r.purple150,[o(r.blue60,.4)]:o(r.purple100,.4),[o(r.blue60,.8)]:o(r.purple100,.8),[o(c.tint,.05)]:o(c.componentTint,.05),[o(c.tint,.08)]:o(c.componentTint,.08),[o(c.tint,.1)]:o(c.componentTint,.1),[o(c.tint,.15)]:o(c.componentTint,.15),[o(c.tint,.5)]:o(c.componentTint,.5)},E={[e.tint]:e.componentTint,[e.tintDark]:r.purple95,[e.tintDimmed]:e.componentTintDimmed,[r.blue75]:r.purple150,[o(r.blue60,.4)]:o(r.purple90,.4),[o(r.blue60,.8)]:o(r.purple90,.8),[o(e.tint,.05)]:o(e.componentTint,.05),[o(e.tint,.08)]:o(e.componentTint,.08),[o(e.tint,.1)]:o(e.componentTint,.1),[o(e.tint,.15)]:o(e.componentTint,.15),[o(e.tint,.5)]:o(e.componentTint,.5)},G={assetVectorBadgeBackground:c.assetVectorBadgeBackground,buttonBackgroundPrimaryActive:r.purple150,buttonWithDepthPrimaryShadow:c.buttonWithDepthPrimaryComponentShadow,buttonWithDepthPrimaryShadowHover:"0px 1px 2px 0px rgba(119, 51, 255, 0.15), 0px 2px 4px 0px rgba(119, 51, 255, 0.3)",layerItemIconDimmed:c.layerItemIconComponentDimmed,selectionBackground:"color(display-p3 0.52 0.357 0.965 / 0.15)",breadcrumbItemBackgroundTinted:c.componentTintDimmed},W={assetVectorBadgeBackground:e.assetVectorBadgeBackground,buttonBackgroundPrimaryActive:r.purple150,layerItemIconDimmed:e.layerItemIconComponentDimmed,selectionBackground:"color(display-p3 0.52 0.357 0.965 / 0.15)",breadcrumbItemBackgroundTinted:e.componentTintDimmed},tr={avatarTinted:`inset 0 0 0 1px ${o(c.componentTint,.15)}`,distributionSliderKnobSelected:`inset 0 0 0 3px white, inset 0 0 0 4px ${c.componentTint}, 0 0 0 1px ${c.componentTint}`,gradientSliderKnobSelected:`inset 0 0 0 3px white, inset 0 0 0 4px ${c.componentTint}, 0 0 0 1px ${c.componentTint}`},lr={tokens:tr,scope:t},nr={avatarTinted:`inset 0 0 0 1px ${o(e.componentTint,.15)}`,distributionSliderKnobSelected:`inset 0 0 0 3px white, inset 0 0 0 4px ${e.componentTint}, 0 0 0 1px ${e.componentTint}`,gradientSliderKnobSelected:`inset 0 0 0 3px white, inset 0 0 0 4px rgba(0, 0, 0, 0.1), 0 0 0 1px ${e.panelBackground}, 0 0 0 2px ${e.componentTint}`},sr={tokens:nr,scope:t},y={light:`
	${m("light",V,G)}
	${f([lr])}
`,dark:`
	${m("dark",E,W)}
	${f([sr])}
`},I={light:m("light",V,{...G,canvasBackground:c.canvasComponentOverlayEditModeBackground,rulerBackground:"#DFCEFF",rulerBorderColor:c.rulerComponentOverlayEditModeBorderColor,rulerTextColor:c.rulerComponentOverlayEditModeTextColor,rulerTickColor:c.rulerComponentOverlayEditModeTickColor,rulerFadeOut:"rgba(136, 85, 255, 0)"}),dark:m("dark",E,{...W,canvasBackground:e.canvasComponentOverlayEditModeBackground,rulerBackground:"#332455",rulerBorderColor:e.rulerComponentOverlayEditModeBorderColor,rulerTextColor:e.rulerComponentOverlayEditModeTextColor,rulerTickColor:e.rulerComponentOverlayEditModeTickColor,rulerFadeOut:"rgba(136, 85, 255, 0)"})};var $={tint:r.white100,buttonBackgroundPrimary:r.white100,buttonBackgroundPrimaryHover:o(r.white100,.98),buttonBackgroundPrimaryActive:o(r.white100,.96),buttonTextPrimary:r.dark90,comboBoxHighlightedRowTint:o(r.white100,.2),comboBoxHighlightedRowText:r.white100,swatchBackgroundPlaceholderForLink:r.dark50},j=m("light",{},$),K=m("dark",{},$);var d="0px 3px 6px 0px rgba(0, 0, 0, 0.08)",h=`${d}, 0px 0px 0px 1px rgba(0, 0, 0, 0.05)`,k=`inset 0px 0px 0px 1px ${o(r.white100,.07)}`;var mr={popoverInset:k},ir={tokens:mr,scope:t},q=f([ir]);var dr={panelBackground:e.popoverBackground,panelDivider:e.popoverDivider,inputBackground:r.dark83,buttonBackground:r.dark82,buttonBackgroundHover:r.dark80,popupButtonBackground:r.dark71,radioButtonBackground:r.dark71,segmentedControlDivider:r.dark60,segmentedControlItemBackgroundSelected:r.dark63,checkboxLabel:r.light80,menuBackground:r.dark81,menuSeparator:o(r.white100,.07),menuBackgroundActive:r.dark74,menuText:r.white100,menuTextActive:r.white100,tabsBackgroundSelected:r.dark83},pr={menu:`${d}, 0px 0px 0px 1px ${r.dark72}`},gr={menuBackgroundActive:r.light59,menuText:r.dark80,menuTextActive:r.dark90,inputBackground:r.light55,inputText:r.dark90},ur={tokens:gr,scope:a},U=f([ur]),Br={tokens:dr,scope:a},kr={tokens:pr,scope:t},z=f([Br,kr]);var xr={tooltipBackground:r.dark81},br={tokens:xr,scope:a},N=f([br]);var Q={avatar:`inset 0 0 0 1px ${o(r.white100,.1)}`,avatarOverlap:`0px 0px 0px 1.5px ${T.panelBackground}, inset 0 0 0 1px ${o(r.white100,.05)}`,avatarTinted:`inset 0 0 0 1px ${o(e.tint,.15)}`,buttonSelected:"0px 2px 4px 0px rgba(0, 0, 0, 0.3), 0px 1px 0px 0px rgba(0, 0, 0, 0.05)",canvasTooltip:"0px 3px 6px 0px rgba(0, 0, 0, 0.08), inset 0px 0px 0px 1px rgba(255, 255, 255, 0.07)",card:"0 5px 20px rgba(0, 0, 0, 0.3)",checkbox:"inset 0 0 0 1px rgba(255, 255, 255, 0.1)",checkboxDarker:"inset 0 0 0 1px rgba(255, 255, 255, 0.1)",checkboxChecked:"inset 0 0 0 1px rgba(255, 255, 255, 0.2)",checkboxDarkerChecked:"inset 0 0 0 1px rgba(255, 255, 255, 0.2)",distributionSliderBar:"inset 0 0 0 1px var(--framer-fresco-gradientStopSliderBorder-color, rgba(0, 0, 0, 0.05))",distributionSliderKnob:"inset 0 0 0 3px white, inset 0 0 0 4px rgba(0, 0, 0, 0.1), 0 0 0 1px rgba(0, 0, 0, 0.1)",distributionSliderKnobSelected:`inset 0 0 0 3px white, inset 0 0 0 4px ${e.tint}, 0 0 0 1px ${e.tint}`,gradientSliderKnobSelected:`inset 0 0 0 3px white, inset 0 0 0 4px rgba(0, 0, 0, 0.1), 0 0 0 1px ${e.panelBackground}, 0 0 0 2px ${e.tint}`,insertImage:"0px 4px 8px 0px rgba(0, 0, 0, 0.2)",menu:`${d}, 0px 0px 0px 1px ${r.dark80}`,modal:d,modalInset:k,popover:d,popoverInset:k,popoverDropShadow:"drop-shadow(0px 2px 4px rgba(0, 0, 0, 0.08)) drop-shadow(0px 2px 10px rgba(0, 0, 0, 0.2))",projectMenuButton:"none",radioButton:"inset 0 0 0 1px rgba(0, 0, 0, 0.05)",radioButtonChecked:"inset 0 0 0 1px rgba(255, 255, 255, 0.2)",settingsCard:"0px 1px 1px 0px rgba(0, 0, 0, 0.1), 0px 2px 10px 0px rgba(0, 0, 0, 0.05)",sideOverlay:"0px 3px 6px 0px rgba(0, 0, 0, 0.08), 0px 0px 0px 1px rgba(0, 0, 0, 0.05), inset 1px 0 0 0 #222222",segmentedControlItemSelected:"inset 0 0 0 1px rgba(255, 255, 255, 0.03)",multiComboBoxToken:"none",sliderKnob:"none",toggleTack:"0px 1px 1px 0px rgba(0, 0, 0, 0.1), 0px 2px 10px 0px rgba(0, 0, 0, 0.05)",settingsImageClearButton:"0px 1px 3px 0px rgba(0, 0, 0, 0.2), 0px 0.5px 0px 0px rgba(0, 0, 0, 0.1)"};var P={avatar:"inset 0 0 0 1px rgba(0, 0, 0, 0.1)",avatarOverlap:`0px 0px 0px 1.5px ${T.panelBackground}, inset 0 0 0 1px ${o(r.white100,.05)}`,avatarTinted:`inset 0 0 0 1px ${o(c.tint,.15)}`,buttonSelected:"0px 2px 4px 0px rgba(0, 0, 0, 0.1), 0px 1px 0px 0px rgba(0, 0, 0, 0.05)",canvasTooltip:"0px 3px 6px 0px rgba(0, 0, 0, 0.08), 0px 0px 0px 1px rgba(0, 0, 0, 0.05)",card:"0 5px 20px rgba(0, 0, 0, 0.15)",checkbox:"inset 0 0 0 1px rgba(0, 0, 0, 0.1)",checkboxDarker:"inset 0 0 0 1px rgba(0, 0, 0, 0.1)",checkboxChecked:"none",checkboxDarkerChecked:"none",distributionSliderBar:"inset 0 0 0 1px var(--framer-fresco-gradientStopSliderBorder-color, rgba(0, 0, 0, 0.05))",distributionSliderKnob:"inset 0 0 0 3px white, inset 0 0 0 4px rgba(0, 0, 0, 0.1), 0 0 0 1px rgba(0, 0, 0, 0.1)",distributionSliderKnobSelected:`inset 0 0 0 3px white, inset 0 0 0 4px ${c.tint}, 0 0 0 1px ${c.tint}`,gradientSliderKnobSelected:`inset 0 0 0 3px white, inset 0 0 0 4px ${c.tint}, 0 0 0 1px ${c.tint}`,insertImage:"0px 4px 8px 0px rgba(0, 0, 0, 0.1)",menu:h,modal:h,modalInset:"none",popover:h,popoverInset:"none",popoverDropShadow:"drop-shadow(0px 1px 8px rgba(0, 0, 0, 0.08)) drop-shadow(0px 5px 20px rgba(0, 0, 0, 0.1))",projectMenuButton:"0px 0px 0px 1px rgba(0, 0, 0, 0.02), 0px 1px 0px 0px rgba(0, 0, 0, 0.05), 0px 2px 4px 0px rgba(0, 0, 0, 0.1)",radioButton:"inset 0 0 0 1px rgba(0, 0, 0, 0.08)",radioButtonChecked:"none",settingsCard:"0px 1px 1px 0px rgba(0, 0, 0, 0.1), 0px 2px 10px 0px rgba(0, 0, 0, 0.05)",sideOverlay:"0px 3px 6px 0px rgba(0, 0, 0, 0.08), 0px 0px 0px 1px rgba(0, 0, 0, 0.05)",segmentedControlItemSelected:"0px 0px 0px 1px rgba(0, 0, 0, 0.04), 0px 1px 0px 0px rgba(0, 0, 0, 0.04), 0px 2px 4px 0px rgba(0, 0, 0, 0.08)",multiComboBoxToken:"0px 0px 0px 1px rgba(0, 0, 0, 0.03)",sliderKnob:"0px 2px 4px 0px rgba(0, 0, 0, 0.1), 0px 1px 0px 0px rgba(0, 0, 0, 0.05), 0px 0px 0px 1px rgba(0, 0, 0, 0.03)",toggleTack:"0px 1px 1px 0px rgba(0, 0, 0, 0.1), 0px 2px 10px 0px rgba(0, 0, 0, 0.05)",settingsImageClearButton:"0px 1px 3px 0px rgba(0, 0, 0, 0.2), 0px 0.5px 0px 0px rgba(0, 0, 0, 0.1)"};var Po=F(P,t),J={tokens:P,scope:t},X={tokens:Q,scope:t};var Tr={tokens:c,scope:a},hr={tokens:e,scope:a},Y=f([Tr,J]),Z=f([hr,X]);var Ko={component:`
		body[data-framer-theme="light"] & {
			${y.light}
		}
		body[data-framer-theme="dark"] & {
			${y.dark}
		}
`,componentOverlayEditMode:`
		body[data-framer-theme="light"] & {
			${I.light}
		}
		body[data-framer-theme="dark"] & {
			${I.dark}
		}
`,popover:`
		body[data-framer-theme="dark"] & {
			${z}
		}
		body[data-framer-theme="light"] & {
			${U}
		}
`,darkOnDarkPopoutWindow:`
		body[data-framer-theme="dark"] & {
			${q}
		}
`,tooltipVariantLighter:`
		body[data-framer-theme="dark"] & {
			${N}
		}
`,darkOnDarkModal:`
		body[data-framer-theme="dark"] & {
			${L}
		}
`,modalVariantDefault:`
		body[data-framer-theme="dark"] & {
			${O}
		}
`,modalVariantDarker:`
		body[data-framer-theme="dark"] & {
			${R}
		}
`,inverted:`
		body[data-framer-theme="light"] & {
			${Z}
		}
		body[data-framer-theme="dark"] & {
			${Y}
		}
`,onPageEditing:`
		body[data-framer-theme="light"] & {
			${j}
		}
		body[data-framer-theme="dark"] & {
			${K}
		}
`},_={component:"c1umhcny",componentOverlayEditMode:"c12c8kmr",popover:"p752w4z",darkOnDarkPopoutWindow:"d1ng92sv",tooltipVariantLighter:"t1cyscb0",darkOnDarkModal:"d1f7bw7u",modalVariantDefault:"m1ysjty9",modalVariantDarker:"m1js5p3h",inverted:"i7h4j38",onPageEditing:"o800e5d"},rr="wpnx597";var x=C(H());function vr(l){return l!==!1&&l!==void 0}var D=p.default.createContext(void 0);D.displayName="BaseThemeContext";var w=p.default.createContext(void 0);w.displayName="ThemeOverrideModeContext";function or(){return p.default.useContext(D)}function Cr(){return p.default.useContext(w)}var Sr=p.default.forwardRef(function({mode:n,children:s,className:u,...B},g){let b=Cr(),i=or(),v=n||b||i,er=vr(v)?_[v]:void 0;return(0,x.jsx)(w.Provider,{value:v,children:(0,x.jsx)("div",{ref:g,className:M(rr,er,u),...B,children:s})})}),Qo=p.default.memo(function({mode:n,children:s}){let u=or();return A(u===void 0,"Nested BaseTheme components are not allowed. BaseTheme should only be used once per application root."),(0,x.jsx)(D.Provider,{value:n,children:(0,x.jsx)(Sr,{children:s})})});export{Po as a,or as b,Cr as c,Sr as d,Qo as e};
//# sourceMappingURL=https://martamonteagudo.com/app.framerstatic.com/chunk-MRYH34AU.mjs.map
