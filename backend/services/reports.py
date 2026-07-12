import io
import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt
import matplotlib.dates as mdates
import pandas as pd
import numpy as np
from fpdf import FPDF

_DARK_BG = "#0a0e1a"
_ACCENT = "#00d4aa"
_ACCENT2 = "#3b82f6"
_TEXT = "#e2e8f0"
_MUTED = "#94a3b8"


def _build_bar_chart(labels: list[str], values: list[float], title: str) -> bytes:
    fig, ax = plt.subplots(figsize=(6, 3))
    fig.patch.set_facecolor(_DARK_BG)
    ax.set_facecolor(_DARK_BG)
    bars = ax.barh(range(len(values)), values, color=_ACCENT, height=0.6)
    ax.set_yticks(range(len(labels)))
    ax.set_yticklabels([l[:20] + "..." if len(l) > 20 else l for l in labels], color=_TEXT, fontsize=8)
    ax.set_xlabel(title, color=_MUTED, fontsize=9)
    ax.tick_params(colors=_MUTED, labelsize=8)
    for spine in ax.spines.values():
        spine.set_color("#1e2740")
    ax.invert_yaxis()
    buf = io.BytesIO()
    fig.savefig(buf, format="png", dpi=150, bbox_inches="tight", facecolor=_DARK_BG)
    plt.close(fig)
    buf.seek(0)
    return buf.read()


def _build_line_chart(dates: list[str], values: list[float], title: str) -> bytes:
    fig, ax = plt.subplots(figsize=(6, 2.5))
    fig.patch.set_facecolor(_DARK_BG)
    ax.set_facecolor(_DARK_BG)
    x = pd.to_datetime(dates)
    ax.plot(x, values, color=_ACCENT, linewidth=2)
    ax.fill_between(x, values, alpha=0.1, color=_ACCENT)
    ax.set_xlabel(title, color=_MUTED, fontsize=9)
    ax.tick_params(colors=_MUTED, labelsize=8)
    for spine in ax.spines.values():
        spine.set_color("#1e2740")
    ax.xaxis.set_major_locator(mdates.AutoDateLocator())
    ax.xaxis.set_major_formatter(mdates.DateFormatter("%b %d"))
    buf = io.BytesIO()
    fig.savefig(buf, format="png", dpi=150, bbox_inches="tight", facecolor=_DARK_BG)
    plt.close(fig)
    buf.seek(0)
    return buf.read()


def _build_pie_chart(labels: list[str], values: list[float]) -> bytes:
    fig, ax = plt.subplots(figsize=(3, 3))
    fig.patch.set_facecolor(_DARK_BG)
    colors = ["#00d4aa", "#3b82f6", "#f59e0b", "#ef4444", "#a78bfa", "#34d399", "#f97316", "#06b6d4"]
    wedges, texts, autotexts = ax.pie(
        values, labels=None, autopct="%1.0f%%", startangle=90,
        colors=colors[:len(labels)], textprops={"color": _TEXT, "fontsize": 8},
        pctdistance=0.75, wedgeprops={"linewidth": 1, "edgecolor": _DARK_BG},
    )
    for at in autotexts:
        at.set_fontsize(7)
    ax.legend(labels, loc="lower center", bbox_to_anchor=(0.5, -0.15),
              ncol=2, frameon=False, fontsize=7, labelcolor=_MUTED)
    buf = io.BytesIO()
    fig.savefig(buf, format="png", dpi=150, bbox_inches="tight", facecolor=_DARK_BG)
    plt.close(fig)
    buf.seek(0)
    return buf.read()


class ReportPDF(FPDF):
    def __init__(self):
        super().__init__("P", "mm", "A4")
        self.set_auto_page_break(auto=True, margin=20)

    def header(self):
        if self.page_no() > 1:
            self.set_font("Helvetica", "I", 7)
            self.set_text_color(100, 100, 100)
            self.cell(0, 8, "PredictIQ Report", align="L")
            self.cell(0, 8, f"Page {self.page_no()}/{{nb}}", align="R", new_x="LMARGIN", new_y="NEXT")

    def footer(self):
        pass

    def section_title(self, title: str):
        self.set_font("Helvetica", "B", 13)
        self.set_text_color(0, 120, 100)
        self.cell(0, 10, title, new_x="LMARGIN", new_y="NEXT")
        self.set_draw_color(0, 180, 150)
        self.line(10, self.get_y(), 200, self.get_y())
        self.ln(4)

    def body_text(self, text: str):
        self.set_font("Helvetica", "", 9)
        self.set_text_color(30, 30, 30)
        self.multi_cell(0, 5, text)
        self.ln(2)

    def kpi_card(self, label: str, value: str, sub: str = ""):
        self.set_fill_color(240, 245, 250)
        x = self.get_x()
        y = self.get_y()
        w = 44
        h = 22
        if x + w > 190:
            self.ln()
            x = self.get_x()
            y = self.get_y()
        self.rect(x, y, w, h, style="F")
        self.set_xy(x + 3, y + 3)
        self.set_font("Helvetica", "", 6)
        self.set_text_color(100, 100, 100)
        self.cell(w - 6, 4, label.upper())
        self.set_xy(x + 3, y + 9)
        self.set_font("Helvetica", "B", 14)
        self.set_text_color(0, 120, 100)
        self.cell(w - 6, 6, str(value))
        if sub:
            self.set_xy(x + 3, y + 16)
            self.set_font("Helvetica", "", 6)
            self.set_text_color(100, 100, 100)
            self.cell(w - 6, 4, sub)
        self.set_xy(x + w, y)


def generate_pdf_report(
    file_name: str,
    rows: list[dict],
    meta: list[dict],
    kpis: list[dict] | None = None,
    forecast: list[dict] | None = None,
    insights: list[dict] | None = None,
) -> bytes:
    pdf = ReportPDF()
    pdf.alias_nb_pages()

    df = pd.DataFrame(rows)
    num_cols = [c["name"] for c in meta if c.get("type") == "numeric"]
    cat_cols = [c["name"] for c in meta if c.get("type") == "categorical"]
    metric_cols = [c for c in num_cols if not any(k in c.lower() for k in ["id", "code", "key", "index", "timestamp"])]

    revenue_col = _find_col(metric_cols, ["revenue", "sale", "gross", "income", "turnover"])
    earnings_col = _find_col(metric_cols, ["earning", "profit", "net", "royalty", "margin"])
    units_col = _find_col(metric_cols, ["unit", "sold", "qty", "quantity", "volume", "count"])
    price_col = _find_col(metric_cols, ["price", "cost", "fee", "amount", "rate"])
    rating_col = _find_col(metric_cols, ["rating", "score", "star", "review"])
    cat_col = cat_cols[0] if cat_cols else None

    # ── Title page ──
    pdf.add_page()
    pdf.ln(50)
    pdf.set_font("Helvetica", "B", 32)
    pdf.set_text_color(0, 120, 100)
    pdf.cell(0, 15, "PredictIQ", align="C", new_x="LMARGIN", new_y="NEXT")
    pdf.set_font("Helvetica", "", 14)
    pdf.set_text_color(30, 30, 30)
    pdf.cell(0, 10, "Performance Report", align="C", new_x="LMARGIN", new_y="NEXT")
    pdf.ln(8)
    pdf.set_font("Helvetica", "", 10)
    pdf.set_text_color(80, 80, 80)
    pdf.cell(0, 7, file_name, align="C", new_x="LMARGIN", new_y="NEXT")
    pdf.cell(0, 7, f"{len(rows)} rows  |  {len(meta)} columns", align="C", new_x="LMARGIN", new_y="NEXT")
    pdf.ln(30)
    pdf.set_font("Helvetica", "I", 8)
    pdf.set_text_color(120, 120, 120)
    pdf.cell(0, 7, "Generated by PredictIQ", align="C")

    # ── Executive Summary ──
    pdf.add_page()
    pdf.section_title("Executive Summary")
    total_rev = _sum_col(df, revenue_col)
    total_units = _sum_int(df, units_col)
    avg_price = total_rev / total_units if total_units else 0
    summary_lines = []
    if revenue_col:
        summary_lines.append(f"Total Revenue: ${total_rev:,.2f}")
    if units_col:
        summary_lines.append(f"Total Units Sold: {int(total_units):,}")
    if price_col and total_units:
        summary_lines.append(f"Average Price: ${avg_price:.2f}")
    if earnings_col:
        total_earn = _sum_col(df, earnings_col)
        margin = (total_earn / total_rev * 100) if total_rev else 0
        summary_lines.append(f"Estimated Earnings: ${total_earn:,.2f} ({margin:.1f}% margin)")
    if rating_col:
        avg_rating = df[rating_col].astype(float).mean()
        summary_lines.append(f"Average Rating: {avg_rating:.2f} / 5.0")
    summary_lines.append(f"Data Quality Score: {_calc_quality(meta):.0f}%")
    for line in summary_lines:
        pdf.body_text(f"  -  {line}")

    # ── KPI Cards ──
    pdf.ln(4)
    pdf.section_title("Key Metrics")
    kpi_data = []
    if revenue_col:
        kpi_data.append(("Revenue", f"${total_rev:,.0f}", ""))
    if earnings_col:
        total_earn = _sum_col(df, earnings_col)
        margin = (total_earn / total_rev * 100) if total_rev else 0
        kpi_data.append(("Earnings", f"${total_earn:,.0f}", f"{margin:.1f}% margin"))
    if units_col:
        kpi_data.append(("Transactions", f"{int(total_units):,}", ""))
    for label, val, sub in kpi_data[:4]:
        pdf.kpi_card(label, val, sub)
    pdf.ln(24)

    # ── Revenue by Category chart ──
    if revenue_col and cat_col:
        pdf.section_title(f"Revenue by {cat_col}")
        grouped = df.groupby(cat_col)[revenue_col].sum().sort_values(ascending=False).head(8)
        if len(grouped) > 0:
            chart = _build_bar_chart(
                [str(k)[:25] for k in grouped.index],
                [float(v) for v in grouped.values],
                f"Revenue ({revenue_col})",
            )
            pdf.image(io.BytesIO(chart), x=15, w=175)
            pdf.ln(4)

    # ── Revenue trend ──
    date_candidates = [c for c in df.columns if any(k in c.lower() for k in
                       ["date", "time", "timestamp", "day", "month", "year", "created", "period"])]
    date_col_found = None
    for dc in date_candidates:
        try:
            pd.to_datetime(df[dc], errors="raise")
            date_col_found = dc
            break
        except (ValueError, TypeError):
            pass
    if date_col_found and (revenue_col or metric_cols):
        val_col = revenue_col or metric_cols[0]
        trend_df = df[[date_col_found, val_col]].copy()
        trend_df[date_col_found] = pd.to_datetime(trend_df[date_col_found], errors="coerce")
        trend_df = trend_df.sort_values(date_col_found).dropna()
        trend_df = trend_df.groupby(trend_df[date_col_found].dt.date)[val_col].sum().reset_index()
        if len(trend_df) > 1:
            pdf.section_title("Revenue Trend")
            chart = _build_line_chart(
                [str(d) for d in trend_df.iloc[:, 0]],
                [float(v) for v in trend_df.iloc[:, 1]],
                val_col,
            )
            pdf.image(io.BytesIO(chart), x=15, w=175)
            pdf.ln(4)

    # ── Top Products table ──
    if revenue_col:
        pdf.section_title("Top Products by Revenue")
        top = df.nlargest(15, revenue_col) if revenue_col in df.columns else df.head(15)
        cols = [revenue_col]
        if units_col:
            cols.insert(0, units_col)
        if price_col:
            cols.insert(0, price_col)
        if cat_col:
            cols.insert(0, cat_col)
        cols.insert(0, "name")

        name_col = _find_col(list(df.columns), ["product", "app", "name", "title"]) or df.columns[0]
        col_widths = [70] + [25] * (len(cols) - 1)
        pdf.set_font("Helvetica", "B", 7)
        pdf.set_fill_color(0, 180, 150)
        pdf.set_text_color(255, 255, 255)
        headers = ["Product"] + [c[:12] for c in cols[1:]]
        for i, h in enumerate(headers):
            pdf.cell(col_widths[i], 7, h, border=1, align="C", fill=True)
        pdf.ln()
        pdf.set_font("Helvetica", "", 7)
        pdf.set_text_color(30, 30, 30)
        for _, row in top.iterrows():
            vals = [str(row.get(name_col, "Unknown"))[:30]] + [f"{row.get(c, 0):.2f}" if isinstance(row.get(c), (int, float)) else str(row.get(c, ""))[:10] for c in cols[1:]]
            for i, v in enumerate(vals):
                pdf.cell(col_widths[i], 5.5, v, border=1, align="C")
            pdf.ln()

    # ── Forecast section ──
    if forecast:
        pdf.add_page()
        pdf.section_title("Forecast Summary")
        pdf.body_text(f"Next {len(forecast)} periods forecast using trend + seasonal decomposition.")
        fcst_df = pd.DataFrame(forecast)
        if "yhat" in fcst_df:
            avg_fcst = fcst_df["yhat"].mean()
            pdf.body_text(f"Average forecast value: {avg_fcst:.2f}")
        if "ds" in fcst_df.columns and "yhat" in fcst_df.columns:
            chart = _build_line_chart(
                fcst_df["ds"].tolist()[:60],
                fcst_df["yhat"].tolist()[:60],
                "Forecast",
            )
            pdf.image(io.BytesIO(chart), x=15, w=175)
            pdf.ln(4)

        pdf.section_title("Forecast Values")
        cols_w = [50, 35, 35, 35]
        pdf.set_font("Helvetica", "B", 7)
        pdf.set_fill_color(0, 180, 150)
        pdf.set_text_color(255, 255, 255)
        for i, h in enumerate(["Date", "Forecast", "Lower", "Upper"]):
            pdf.cell(cols_w[i], 7, h, border=1, align="C", fill=True)
        pdf.ln()
        pdf.set_font("Helvetica", "", 7)
        pdf.set_text_color(30, 30, 30)
        for _, frow in fcst_df.head(20).iterrows():
            pdf.cell(cols_w[0], 5.5, str(frow.get("ds", ""))[:12], border=1, align="C")
            pdf.cell(cols_w[1], 5.5, f"{frow.get('yhat', 0):.2f}", border=1, align="C")
            pdf.cell(cols_w[2], 5.5, f"{frow.get('yhat_lower', 0):.2f}", border=1, align="C")
            pdf.cell(cols_w[3], 5.5, f"{frow.get('yhat_upper', 0):.2f}", border=1, align="C")
            pdf.ln()
        if len(fcst_df) > 20:
            pdf.body_text(f"... and {len(fcst_df) - 20} more forecast periods")

    # ── Insights ──
    if insights:
        pdf.add_page()
        pdf.section_title("AI Insights")
        for ins in insights[:5]:
            content = ins.get("content") or ins.get("insight") or ins.get("text", "")
            if content:
                pdf.set_font("Helvetica", "B", 9)
                pdf.set_text_color(40, 80, 180)
                pdf.cell(0, 6, ins.get("title", "Insight")[:60], new_x="LMARGIN", new_y="NEXT")
                pdf.body_text(content[:300])

    return bytes(pdf.output())


def _find_col(cols: list[str], keywords: list[str]) -> str | None:
    for c in cols:
        cl = c.lower().replace("_", " ").replace("-", " ")
        if any(kw in cl for kw in keywords):
            return c
    return None


def _sum_col(df: pd.DataFrame, col: str | None) -> float:
    return float(df[col].sum()) if col and col in df.columns else 0.0


def _sum_int(df: pd.DataFrame, col: str | None) -> float:
    return float(df[col].fillna(0).astype(float).sum()) if col and col in df.columns else 0.0


def _calc_quality(meta: list[dict]) -> float:
    total = sum(c.get("total", 1) for c in meta) or 1
    nulls = sum(c.get("nulls", 0) for c in meta)
    return (1 - nulls / total) * 100
