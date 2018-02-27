defmodule WweloApi.SiteScraper.Wrestlers do
  import Ecto.Query

  alias WweloApi.Repo
  alias WweloApi.Stats
  alias WweloApi.Stats.Wrestler
  alias WweloApi.SiteScraper.Utils.DateHelper
  alias WweloApi.SiteScraper.Utils.UrlHelper

  @default_elo 1200

  @default_wrestler_info %{
    wins: 0,
    losses: 0,
    draws: 0,
    current_elo: @default_elo,
    maximum_elo: @default_elo,
    minimum_elo: @default_elo
  }

  def get_wrestler_info(%{wrestler_url_path: wrestler_url_path}) do
    wrestler_url = "https://www.cagematch.net/" <> wrestler_url_path

    wrestler_info =
      UrlHelper.get_page_html_body(%{url: wrestler_url})
      |> Floki.find(".InformationBoxRow")

    wrestler_info
  end

  def convert_wrestler_info(wrestler_info) do
    Enum.reduce(wrestler_info, @default_wrestler_info, fn x, acc ->
      case x do
        {_, _, [{_, _, ["Gender:"]}, {_, _, [gender]}]} ->
          Map.put(acc, :gender, gender)

        {_, _, [{_, _, ["Height:"]}, {_, _, [height]}]} ->
          Map.put(acc, :height, height |> convert_height_to_integer)

        {_, _, [{_, _, ["Weight:"]}, {_, _, [weight]}]} ->
          Map.put(acc, :weight, weight |> convert_weight_to_integer)

        {_, _, [{_, _, ["Beginning of in-ring career:"]}, {_, _, [date]}]} ->
          case DateHelper.format_date(date) do
            {:ok, date} -> Map.put(acc, :start_date, date)
            _ -> acc
          end

        {_, _, [{_, _, ["End of in-ring career:"]}, {_, _, [date]}]} ->
          case DateHelper.format_date(date) do
            {:ok, date} -> Map.put(acc, :end_date, date)
            _ -> acc
          end

        _ ->
          acc
      end
    end)
  end

  def convert_height_to_integer(height) do
    height
    |> String.split(["(", " cm)"])
    |> Enum.at(1)
    |> String.to_integer()
  end

  def convert_weight_to_integer(weight) do
    weight
    |> String.split(["(", " kg)"])
    |> Enum.at(1)
    |> String.to_integer()
  end

  def save_wrestler_to_database(wrestler_info) do
    wrestler_query =
      from(
        w in Wrestler,
        where: w.name == ^wrestler_info.name,
        select: w
      )

    wrestler_result = Repo.one(wrestler_query)

    case wrestler_result do
      nil -> Stats.create_wrestler(wrestler_info) |> elem(1)
      _ -> wrestler_result
    end
  end
end
