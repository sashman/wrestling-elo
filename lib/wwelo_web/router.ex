defmodule WweloWeb.Router do
  use WweloWeb, :router

  use Plug.ErrorHandler
  use Sentry.Plug

  pipeline :browser do
    plug(:accepts, ["html"])
    plug(:fetch_session)
    plug(:fetch_flash)
    plug(:protect_from_forgery)
    plug(:put_secure_browser_headers)
  end

  pipeline :api do
    plug(:accepts, ["json"])
  end

  scope "/api" do
    pipe_through(:api)

    if Application.get_env(:wwelo, :environment) == :dev do
      forward(
        "/graphiql",
        Absinthe.Plug.GraphiQL,
        schema: WweloWeb.Schema
      )
    end

    forward("/", Absinthe.Plug, schema: WweloWeb.Schema)
  end

  scope "/", WweloWeb do
    pipe_through(:browser)

    forward("/", PageController, :index)
  end
end
