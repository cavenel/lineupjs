// import * as vars from 'raw-loader!./_vars.scss';

const vars = `
$engine_assets: '~lineupengine/src/assets';
@import '~lineupengine/src/styles/vars';

$lu_css_prefix: 'lu' !default;

$lu_dialog_font_size: 11pt !default;
$lu_dialog_mouse_region: 40px;
$lu_toolbar_font_size: 11pt !default;
$lu_toolbar_color_base: #c1c1c1 !default;
$lu_toolbar_color_base2: #999 !default;
$lu_toolbar_color_hover: black !default;

$lu_hover_color: #e5e5e5 !default;
$lu_hover_header_color: #f3f3f3 !default;
$lu_selected_color: #ffa500 !default;
$lu_filtered_opacity: 0.2 !default;

$lu_drag_over: rgba(151, 151, 151, 0.8) !default;

$lu_header_background: #6d6c6c !default;

$lu_body_font: 10pt 'Helvetica Neue', Helvetica, Arial, sans-serif !default;
$lu_body_text_hover_color: darkblue !default;

$lu_slope_width: 200px !default;
$lu_slope_color: darkgray !default;
$lu_slope_group_color: rgba(169, 169, 169, 0.5) !default;
$lu_slope_group_selected_color: rgba(255, 165, 0, 0.5) !default;
$lu_slope_stroke_width: 1 !default;

$lu_renderer_boxplot_box: #e0e0e0 !default;
$lu_renderer_boxplot_stroke: black !default;
$lu_renderer_boxplot_sort_indicator: #ffa500 !default;
$lu_renderer_boxplot_outlier: #e0e0e0 !default;

$lu_renderer_upset_circle_color: #676767 !default;
$lu_renderer_upset_inactive_opacity: 0.1 !default;
$lu_renderer_upset_stroke: black !default;

$lu_renderer_dot_color: gray !default;
$lu_renderer_dot_size: 5px !default;
$lu_renderer_dot_opacity: 0.7 !default;

$lu_hist_color: #c1c1c1;

$lu_engine_grip_gap: 5px !default;
$lu_engine_row_outline_width: 2px !default;

$lu_missing_dash_height: 3px !default;
$lu_missing_dash_width: 10px !default;
$lu_missing_dash_color: #c1c1c1 !default;

$lu_axis_color: #c1c1c1 !default;

$lu_mapping_circle: $lu_toolbar_color_base2;
$lu_mapping_hover: $lu_selected_color;
$lu_mapping_bg: $lu_toolbar_color_hover;

$lu_side_panel_bg_color: #f0f0f0 !default;
$lu_side_panel_toolbar_bg: #6d6c6c !default;
$lu_side_panel_input_border: #999 !default;
$lu_side_panel_input_border_radius: 3px !default;
$lu_side_panel_font_size: 14px !default;
$lu_side_panel_toolbar_font_size: 9pt !default;
$lu_side_panel_separator_color: #dedede !default;

$lu_aggregate_square_bracket_width: 8px !default;
$lu_aggregate_square_bracket_stroke_color: #000 !default;
$lu_aggregate_square_bracket_stroke_width: 2px !default;
$lu_aggregate_hierarchy_width: 4px !default;
$lu_aggregate_hierarchy_stroke_width: 1px !default;

$lu_taggle_border_color: #6d6c6c !default;

$lu_assets: './assets' !default;
$lu_use_font_awesome: false !default;
`;

const styles = new Map<string, string>();
{
  const r = /^[$]([\w]+): ([\w #.()'\/,-]+)( !default)?;/gmi;
  const s = String(vars);

  let m: RegExpMatchArray | null = s.match(r);
  while (m != null) {
    styles.set(m[1], m[2]);
    m = s.match(r);
  }
}

/** @internal */
export default function getStyle(key: string, defaultValue = '') {
  if (key[0] === '$') {
    key = key.slice(1);
  }
  if (styles.has(key)) {
    return styles.get(key)!;
  }
  return defaultValue;
}
/** @internal */
export const COLUMN_PADDING = parseInt(getStyle('lu_engine_grip_gap', '5px'), 10);
/** @internal */
export const FILTERED_OPACITY = parseFloat(getStyle('lu_filtered_opacity', '0.2'));
/** @internal */
export const DASH = {
  width: parseInt(getStyle('lu_missing_dash_width', '3px'), 10),
  height: parseInt(getStyle('lu_missing_dash_height', '10px'), 10),
  color: getStyle('lu_missing_dash_color', 'gray')
};
/** @internal */
export const UPSET = {
  circle: getStyle('lu_renderer_upset_circle_color'),
  inactive: parseFloat(getStyle('lu_renderer_upset_inactive_opacity', '0.1')),
  stroke: getStyle('lu_renderer_upset_stroke')
};
/** @internal */
export const DOT = {
  color: getStyle('lu_renderer_dot_color', 'gray'),
  size: parseInt(getStyle('lu_renderer_dot_size', '5px'), 10),
  opacity: parseFloat(getStyle('lu_renderer_dot_opacity', '0.7'))
};
/** @internal */
export const BOX_PLOT = {
  box: getStyle('lu_renderer_boxplot_box', '#e0e0e0'),
  stroke: getStyle('lu_renderer_boxplot_stroke', 'black'),
  sort: getStyle('lu_renderer_boxplot_sort_indicator', '#ffa500'),
  outlier: getStyle('lu_renderer_boxplot_outlier', '#e0e0e0')
};
/** @internal */
export const AGGREGATE = {
  width: parseInt(getStyle('lu_aggregate_square_bracket_width', '4px'), 10),
  strokeWidth: parseInt(getStyle('lu_aggregate_square_bracket_stroke_width', '1px'), 10),
  color: getStyle('lu_aggregate_square_bracket_stroke_color', '#000')
};
/** @internal */
export const SLOPEGRAPH_WIDTH = parseInt(getStyle('lu_slope_width', '200px'), 10);
/** @internal */
export const CANVAS_HEIGHT = 4;

/** @internal */
export const CSS_PREFIX = getStyle('lu_css_prefix', 'lu');
/** @internal */
export const ENGINE_CSS_PREFIX = 'le';

/** @internal */
export function cssClass(suffix?: string) {
  return suffix? `${CSS_PREFIX}-${suffix}` : CSS_PREFIX;
}
/** @internal */
export function engineCssClass(suffix?: string) {
  return suffix? `${ENGINE_CSS_PREFIX}-${suffix}` : ENGINE_CSS_PREFIX;
}

/** @internal */
export function aria(text: string) {
  return `<span class="${cssClass('aria')}" aria-hidden="true">${text}</span>`;
}
