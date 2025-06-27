module DesignSystemHelper
  def colors
    {
      branding: {
        primary: "bg-gradient-to-r from-blue-500 to-purple-600 text-white",
        banner: "bg-gradient-to-r from-blue-500 to-purple-600 text-white",
        secondary: "bg-gradient-to-r from-green-500 to-emerald-600 text-white",
        dark: "bg-gradient-to-tr from-gray-400 to-gray-900 text-white",
        light: "bg-gradient-to-br from-gray-100 to-gray-200 text-gray-800"
      },
      card: {
        use_parent: "bg-transparent",
        light: "bg-gradient-to-r from-gray-100 to-gray-400",
        dark: "bg-gradient-to-r from-gray-600 to-emerald-900",
        background: "bg-gradient-to-br from-blue-500 to-purple-800 text-white"
      }
    }
  end

  def shapes
    {
      button: {
        hero: {
          rounded: "rounded-lg",
          size: "btn-lg"
        },
        main: {
          rounded: "rounded-sm",
          size: "btn-md"
        }
      },
      card: {
        hero: {
          rounded: "rounded-xl"
        },
        main: {
          rounded: "rounded-lg"
        }
      }
    }
  end
  def typography
    {
      hero: {
        title: "text-2xl md:text-3xl lg:text-4xl font-bold",
        subtitle: "text-md md:text-lg lg:text-xl opacity-90"
      },
      card: {
        title: "text-2xl font-semibold",
        subtitle: "text-base opacity-75"
      }
    }
  end
  def spacing
    {
      hero: {
        default: "p-2 text-center",
        padding: "px-4 py-8",
        margin: "mb-8",
        spacing: "hero-content text-center",
        banner: "h-[10%] w-1 text-center"
      },
      card: {
        map_container: "h-[100%] w-[100%] p-10 card-container text-left border",
        map: "card-xl align-items-center",
        thumbnail: "card-sm align-items-left text-left p-10 m-2 h-[100%] w-[100%]"
      }
    }
  end
  def position
    {
      card: {
        default: "",
        background: "none"
      }
    }
  end
end
